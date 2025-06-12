import fs from 'fs';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';

import {Jimp} from 'jimp';

// @ts-ignore: opencv is optional and may not be installed
let cv: typeof import('@u4/opencv4nodejs') | null = null;

export class ClickByMatchingImageService {
    async before() {
        try {
            // note: now inside an async method, top-level await error disappears
            // @ts-ignore: opencv is optional
            cv = await import('@u4/opencv4nodejs');
            console.log('[ClickByMatchingImage] OpenCV engine available.');
        } catch {
            console.warn('OpenCV not available, fallback engine will be used if needed.');
        }

        browser.addCommand('clickByMatchingImage', async (
            referenceImagePath: string,
            options?: {
                scales?: number[],
                confidence?: number,
                engine?: 'opencv' | 'fallback' | 'auto'
            }
        ) => {
            const confidence = options?.confidence ?? 0.7;
            const scales = options?.scales ?? [1.0, 0.9, 0.8, 0.7, 0.6, 0.5];
            const engine = options?.engine ?? 'auto';

            if (engine === 'opencv') {
                if (!cv) throw new Error('OpenCV engine requested but not available.');
                console.log('[ClickByMatchingImage] Using OpenCV engine.');
                await this.clickByMatchingImageWithOpenCV(referenceImagePath, scales, confidence);
            } else if (engine === 'fallback') {
                console.log('[ClickByMatchingImage] Using fallback engine.');
                await this.clickByMatchingImageFallback(referenceImagePath, confidence);
            } else {
                if (cv) {
                    console.log('[ClickByMatchingImage] Using OpenCV engine (auto).');
                    await this.clickByMatchingImageWithOpenCV(referenceImagePath, scales, confidence);
                } else {
                    console.log('[ClickByMatchingImage] Using fallback engine (auto).');
                    await this.clickByMatchingImageFallback(referenceImagePath, confidence);
                }
            }
        });
    }

    async clickByMatchingImageWithOpenCV(referenceImagePath: string, scales: number[], confidence: number): Promise<void> {
        if (!cv) throw new Error('OpenCV not available.');

        const screenshotPath = './temp-screenshot.png';
        try {
            if (!fs.existsSync(referenceImagePath)) {
                throw new Error(`Reference image not found at path: ${referenceImagePath}`);
            }

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

                await clickAt(centerX, centerY);
            } else {
                throw new Error(`No matching image found with confidence >= ${confidence}. Best match: ${bestMatch.maxVal.toFixed(2)}`);
            }
        } finally {
            if (fs.existsSync(screenshotPath)) {
                fs.unlinkSync(screenshotPath);
            }
        }
    }

    async clickByMatchingImageFallback(referenceImagePath: string, confidence: number): Promise<void> {
        const screenshotPath = './temp-screenshot.png';

        try {
            if (!fs.existsSync(referenceImagePath)) {
                throw new Error(`Reference image not found: ${referenceImagePath}`);
            }

            const screenshotBase64 = await browser.takeScreenshot();
            fs.writeFileSync(screenshotPath, Buffer.from(screenshotBase64, 'base64'));


            const [screenshotJimp, referenceJimp] = await Promise.all([
                Jimp.read(screenshotPath),
                Jimp.read(referenceImagePath),
            ]);

            const screenWidth = screenshotJimp.bitmap.width;
            const screenHeight = screenshotJimp.bitmap.height;

            const refWidth = referenceJimp.bitmap.width;
            const refHeight = referenceJimp.bitmap.height;

            const stride = Math.max(1, Math.floor(Math.min(screenWidth, screenHeight) / 100));

            const threshold = 0.1;
            let bestMatch = {x: -1, y: -1, matchConfidence: 0};
            const referencePng = await imageToPng(referenceJimp);
            const totalPixels = refWidth * refHeight;

            for (let y = 0; y <= screenHeight - refHeight; y += stride) {
                for (let x = 0; x <= screenWidth - refWidth; x += stride) {
                    const region = screenshotJimp.clone().crop({x, y, w: refWidth, h: refHeight});

                    const regionPng = await imageToPng(region);

                    const diffCount = pixelmatch(
                        referencePng.data,
                        regionPng.data,
                        undefined,
                        refWidth,
                        refHeight,
                        {threshold}
                    );
                    const matchConfidence = 1 - diffCount / totalPixels;

                    if (matchConfidence > bestMatch.matchConfidence) {
                        bestMatch = {x, y, matchConfidence};
                    }
                }
            }

            const refineRadius = stride;
            for (let dy = -refineRadius; dy <= refineRadius; dy++) {
                for (let dx = -refineRadius; dx <= refineRadius; dx++) {
                    const rx = bestMatch.x + dx;
                    const ry = bestMatch.y + dy;

                    if (rx < 0 || ry < 0 || rx + refWidth > screenWidth || ry + refHeight > screenHeight) continue;

                    const region = screenshotJimp.clone().crop({x: rx, y: ry, w: refWidth, h: refHeight});
                    const regionPng = await imageToPng(region);
                    const diffCount = pixelmatch(
                        referencePng.data,
                        regionPng.data,
                        undefined,
                        refWidth,
                        refHeight,
                        {threshold}
                    );
                    const matchConfidence = 1 - diffCount / totalPixels;

                    if (matchConfidence > bestMatch.matchConfidence) {
                        bestMatch = {x: rx, y: ry, matchConfidence};
                    }
                }
            }

            if (bestMatch.matchConfidence >= confidence) {
                const centerX = bestMatch.x + Math.floor(refWidth / 2);
                const centerY = bestMatch.y + Math.floor(refHeight / 2);
                await clickAt(centerX, centerY);
            } else {
                throw new Error(`No match found. Best match confidence: ${bestMatch.matchConfidence.toFixed(2)}`);
            }

        } finally {
            if (fs.existsSync(screenshotPath)) {
                fs.unlinkSync(screenshotPath);
            }
        }
    }
}

async function imageToPng(image: any): Promise<PNG> {
    const {bitmap} = image;
    const png = new PNG({width: bitmap.width, height: bitmap.height});
    png.data = Buffer.from(bitmap.data);
    return png;
}

async function clickAt(x: number, y: number): Promise<void> {
    const dpr = await browser.execute(() => window.devicePixelRatio);
    const {width, height} = await browser.getWindowSize();

    const adjustedX = Math.round(x / dpr);
    const adjustedY = Math.round(y / dpr);

    if (adjustedX < 0 || adjustedY < 0 || adjustedX > width || adjustedY > height) {
        throw new Error(`Adjusted click target (${adjustedX}, ${adjustedY}) is out of bounds.`);
    }

    console.log({x, y, adjustedX, adjustedY, width, height, dpr});

    await browser.execute(() => window.scrollTo(0, 0));

    await browser.action('pointer', {parameters: {pointerType: 'mouse'}})
        .move({x: adjustedX, y: adjustedY, origin: 'viewport'})
        .down({button: 'left'})
        .pause(10)
        .up({button: 'left'})
        .perform();
}
