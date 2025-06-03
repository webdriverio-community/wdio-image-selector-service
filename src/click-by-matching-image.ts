import cv from '@u4/opencv4nodejs';
import fs from 'fs';

export class ClickByMatchingImageService {
    before() {
        browser.addCommand('clickByMatchingImage', async (
            referenceImagePath: string,
            options?: { scales?: number[], confidence?: number }
        ) => {
            const scales = options?.scales ?? [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
            const confidence = options?.confidence ?? 0.7;
            await this.clickByMatchingImage(referenceImagePath, scales, confidence);
        });
    }

    async clickByMatchingImage(referenceImagePath: string, scales: number[], confidence: number): Promise<void> {
        if (!fs.existsSync(referenceImagePath)) {
            throw new Error(`Reference image not found at path: ${referenceImagePath}`);
        }

        if (confidence < 0 || confidence > 1) {
            throw new Error(`Confidence must be between 0 and 1. Received: ${confidence}`);
        }

        const screenshotPath = './temp-screenshot.png';

        try {
            const screenshotBase64 = await browser.takeScreenshot();
            const screenshotBuffer = Buffer.from(screenshotBase64, 'base64');
            fs.writeFileSync(screenshotPath, screenshotBuffer);

            const screenshotMat = cv.imread(screenshotPath);
            const grayScreenshot = screenshotMat.bgrToGray();
            const originalRefMat = cv.imread(referenceImagePath);
            const grayRefOriginal = originalRefMat.bgrToGray();

            let bestMatch = {maxVal: -1, maxLoc: {x: 0, y: 0}, scale: 1.0, refCols: 0, refRows: 0};

            for (const scale of scales) {
                const resizedRef = grayRefOriginal.resize(
                    Math.floor(grayRefOriginal.rows * scale),
                    Math.floor(grayRefOriginal.cols * scale)
                );

                if (resizedRef.rows > grayScreenshot.rows || resizedRef.cols > grayScreenshot.cols) {
                    continue;
                }

                const matched = grayScreenshot.matchTemplate(resizedRef, cv.TM_CCOEFF_NORMED);
                const {maxVal, maxLoc} = matched.minMaxLoc();

                if (maxVal > bestMatch.maxVal) {
                    bestMatch = {maxVal, maxLoc, scale, refCols: resizedRef.cols, refRows: resizedRef.rows};
                }
            }

            if (bestMatch.maxVal >= confidence) {
                const centerX = bestMatch.maxLoc.x + Math.floor(bestMatch.refCols / 2);
                const centerY = bestMatch.maxLoc.y + Math.floor(bestMatch.refRows / 2);

                await browser.performActions([{
                    type: 'pointer',
                    id: 'mouse',
                    parameters: {pointerType: 'mouse'},
                    actions: [
                        {type: 'pointerMove', duration: 0, x: centerX, y: centerY},
                        {type: 'pointerDown', button: 0},
                        {type: 'pointerUp', button: 0},
                    ]
                }]);
            } else {
                throw new Error(`No matching image found with confidence >= ${confidence}. Best match: ${bestMatch.maxVal.toFixed(2)}`);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(`Error in clickByMatchingImage: ${err.message}`);
                throw err;
            } else {
                console.error(`Unknown error in clickByMatchingImage: ${JSON.stringify(err)}`);
                throw new Error(`Unknown error: ${JSON.stringify(err)}`);
            }
        } finally {
            if (fs.existsSync(screenshotPath)) {
                try {
                    fs.unlinkSync(screenshotPath);
                } catch (cleanupErr: unknown) {
                    if (cleanupErr instanceof Error) {
                        console.warn(`Failed to delete temporary screenshot: ${cleanupErr.message}`);
                    } else {
                        console.warn(`Failed to delete temporary screenshot, unknown error: ${JSON.stringify(cleanupErr)}`);
                    }
                }
            }
        }
    }
}
