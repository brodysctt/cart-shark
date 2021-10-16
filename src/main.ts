import { createPage } from './createPage';
import { downloadImageBase64 } from './utils';
import { navigateToRecaptcha } from './navigateToRecaptcha';
import { getRecaptchaSolution } from './getRecaptchaSolution';

(async () => {
  try {
    let page;
    let recaptchaFrames;
    do {
      page = await createPage();
      recaptchaFrames = await navigateToRecaptcha(page);
      console.log(`# of recaptcha frames: ${recaptchaFrames.length}`);
    } while (recaptchaFrames.length > 1);

    if (recaptchaFrames.length === 0) {
      console.log(`ayyy we're in! no recaptcha. let's get sharking 🦈`);
      await page.close();
      return;
    }

    const recaptchaChallenge = recaptchaFrames[0];
    await page.waitForTimeout(3000);

    const textInstructions = await recaptchaChallenge.$eval(
      'div.rc-imageselect-instructions',
      (div) => {
        const childNodes: NodeListOf<Node> = div.childNodes;
        const textArr = Array.from(childNodes, (child) => child.textContent);
        return textArr.join(' ').replace(/\s+/g, ' ');
      },
    );

    const imageURL = await recaptchaChallenge.$eval('img', (img) =>
      img.getAttribute('src'),
    );

    const encodedImage = await downloadImageBase64(imageURL);

    const tableClass = await recaptchaChallenge.$eval('table', (table) =>
      table.getAttribute('class'),
    );
    const gridSize = Number(tableClass.slice(-1));

    const correctTiles = await getRecaptchaSolution(
      encodedImage,
      textInstructions,
      gridSize,
    );

    console.dir(correctTiles);

    const recaptchaTiles = await recaptchaChallenge.$$('table tbody tr > td');

    for (const correctTile of correctTiles) {
      console.log('about to click a tile boi');
      await recaptchaChallenge.evaluateHandle(
        (recaptchaTile) => recaptchaTile.click(),
        recaptchaTiles[correctTile - 1],
      );
    }
    console.log('tiles have been clicked! time to submit this piece 😛');

    // TODO: Handle refreshed images and submit solution
  } catch (err) {
    console.error(err);
  }
})();
