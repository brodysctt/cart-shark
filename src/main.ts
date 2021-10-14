import * as dotenv from 'dotenv';
import { downloadImageBase64 } from './utils';
import { resolveCaptchas } from './resolveCaptchas';

import { createPage } from './createPage';

dotenv.config();
const { EMAIL, PASSWORD } = process.env;

(async () => {
  try {
    const page = await createPage();
    await page.goto('https://www.instacart.ca/');
    await page.click('span.css-utfnc');
    await page.click('span.css-utfnc');
    await page.waitForSelector('#auth-heading');

    const inputs = await page.$$eval('input', (inputs) =>
      inputs.map((input) => input.id).filter((input) => input),
    );

    for (const input of inputs) {
      if (input.match(/^email/g)) {
        await page.focus(`#${input}`);
        await page.keyboard.type(EMAIL);
      }
      if (input.match(/^password/g)) {
        await page.focus(`#${input}`);
        await page.keyboard.type(PASSWORD);
      }
    }

    await page.click('button[type=submit]');
    await page.waitForTimeout(3000);

    const recaptchaFrames = await page
      .mainFrame()
      .childFrames()
      .filter((f) => f.url().match(/.recaptcha\/api2\/bframe/g));

    console.log(`# of google bframes: ${recaptchaFrames.length}`);

    // TODO: Skip ahead to building a cart
    // TODO: Confirm there's never a case where there's 0 frames and we're not in
    if (recaptchaFrames.length === 0) {
      console.log(`ayyy we're in! no recaptcha. let's get sharking 🦈`);
    }

    // TODO: refactor for retries
    if (recaptchaFrames.length > 1) {
      // await incognito.close();
      console.log('ending script');
      return;
    }

    const recaptchaChallenge = recaptchaFrames[0];
    await page.waitForTimeout(2000);

    const RECAPTCHA_SELECTOR = 'div.rc-imageselect-desc-no-canonical';
    const textInstructions = await recaptchaChallenge.$eval(
      RECAPTCHA_SELECTOR,
      (div) => {
        const childNodes = div.childNodes;
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
