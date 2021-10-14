import { downloadImageBase64 } from './utils';
import { resolveCaptchas } from './resolveCaptchas';

import { createPage } from './createPage';
import { navigateToRecaptcha } from './navigateToRecaptcha';

(async () => {
  try {
    const page = await createPage();
    const recaptchaFrames = await navigateToRecaptcha(page);
    console.log(`# of google bframes: ${recaptchaFrames.length}`);

    if (recaptchaFrames.length === 0) {
      console.log(`ayyy we're in! no recaptcha. let's get sharking 🦈`);
      await page.close();
      return;
    }

    // TODO: refactor for retries
    if (recaptchaFrames.length > 1) {
      await page.close();
      console.log('ending script');
      return;
    }

    const recaptchaChallenge = recaptchaFrames[0];
    await page.waitForTimeout(2000);

    const RECAPTCHA_SELECTOR = 'div.rc-imageselect-desc-no-canonical';
    const textInstructions = await recaptchaChallenge.$eval(
      RECAPTCHA_SELECTOR,
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

    await resolveCaptchas(encodedImage, textInstructions, gridSize);

    // await incognito.close();
  } catch (err) {
    console.error(err);
  }
})();
