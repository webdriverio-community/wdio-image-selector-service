import {browser, expect} from '@wdio/globals'

describe('Avocado Game', () => {
    // it('should load the game page', async () => {
    //     await browser.url('/');
    //     const canvas = $('#gameCanvas');
    //     await expect(canvas).toBeDisplayed();
    // });

    it('should click on the canvas and increase score', async () => {
        await browser.url('/');
        await browser.pause(4000);
        console.log("±±±±±±±±±±±±±±±±±±±±±±±±±±±±")
        await browser.clickByMatchingImage('./assets/trap_test.png');
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        await browser.pause(8000);
        await browser.clickByMatchingImage('./assets/trap_test.png');
        await browser.clickByMatchingImage('./assets/trap_test.png');
        await browser.pause(8000);
        await browser.clickByMatchingImage('./assets/trap_test.png');
    });
});

