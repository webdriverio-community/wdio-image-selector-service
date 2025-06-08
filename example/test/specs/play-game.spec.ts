import { browser, expect } from '@wdio/globals';

describe('Whack-A-Guac Game', () => {
    const avocadoImagePath = './assets/avocado.png';
    const initialScore = 'Score: 0';
    const avocadoScore = 'Score: 1';

    const getScoreText = async () => {
        return await $('#scoreDisplay').getText();
    };

    beforeEach(async () => {
        await browser.url('/');
        // Supposedly no elements in the canvas exist so we need to wait for the game to load
        await browser.pause(3000);
    });

    it('should correctly click the trap using OpenCV engine and update score', async () => {
        const scoreBefore = await getScoreText();
        expect(scoreBefore).toBe(initialScore);

        await browser.clickByMatchingImage(avocadoImagePath, { engine: 'opencv' });

        const scoreAfter = await getScoreText();
        expect(scoreAfter).toBe(avocadoScore);
    });

    it('should correctly click the trap using Fallback engine and update score', async () => {
        const scoreBefore = await getScoreText();
        expect(scoreBefore).toBe(initialScore);

        await browser.clickByMatchingImage(avocadoImagePath, { engine: 'fallback' });

        const scoreAfter = await getScoreText();
        expect(scoreAfter).toBe(avocadoScore);
    });
});
