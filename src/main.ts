import { downloadImageBase64 } from './utils';
import { resolveCaptchas } from './resolveCaptchas';

import { createPage } from './createPage';
import { navigateToRecaptcha } from './navigateToRecaptcha';

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
  } catch (err) {
    console.error(err);
  }
})();
