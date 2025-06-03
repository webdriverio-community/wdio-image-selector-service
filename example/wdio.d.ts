declare namespace WebdriverIO {
    interface Browser {
        clickByMatchingImage(
            referenceImagePath: string,
            options?: {
                scales?: number[];
                confidence?: number;
            }
        ): Promise<void>;
    }
}
