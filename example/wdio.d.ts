declare namespace WebdriverIO {
    interface Browser {
        clickByMatchingImage(
            referenceImagePath: string,
            options?: {
                scales?: number[];
                confidence?: number;
                engine?: 'opencv' | 'fallback' | 'auto';
            }
        ): Promise<void>;
    }
}
