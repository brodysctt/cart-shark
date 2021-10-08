import * as puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';

import {
  // sendCaptchaRequest,
  // getCaptchaResponse,
  // CaptchaResponse,
  createCaptchaRequestData,
} from './resolveCaptchas';

import { downloadImageBase64 } from './utils';

dotenv.config();
const { EMAIL, PASSWORD } = process.env;

(async () => {
  try {
    const browser = await puppeteer.launch({
      devtools: true,
      args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });
    const incognito = await browser.createIncognitoBrowserContext();
    const page = await incognito.newPage();
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
    await page.waitForTimeout(2000);

    const recaptchaFrames = await page
      .mainFrame()
      .childFrames()
      .filter((f) => f.url().match(/.recaptcha\/api2\/bframe/g));

    console.log(`# of google bframes: ${recaptchaFrames.length}`);

    // TODO: refactor for retries
    if (recaptchaFrames.length !== 1) {
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

    const captchaRequestData = createCaptchaRequestData(
      encodedImage,
      textInstructions,
    );

    console.log(JSON.stringify(captchaRequestData));

    // await resolveCaptcha(encodedImage, textInstructions);

    await incognito.close();
  } catch (err) {
    console.error(err);
  }
})();

/* TODO: Reimplement once testing in Insomnia is complete
const resolveCaptcha = async (encodedImage, textInstructions) => {
  console.log('sending captcha request...');
  const captchaId: string | void = await sendCaptchaRequest(
    encodedImage,
    textInstructions,
  );
  console.log(`here be the captcha id: ${captchaId}`);

  console.log('initiating response poll...');
  let response: CaptchaResponse;
  while (response === 'CAPCHA_NOT_READY') {
    await delay(10000);
    console.log('hitting response endpoint...');
    response = await getCaptchaResponse(captchaId);
  }

  console.log('out of the while loop');

  // Why can I test for truthiness here, but not in the while block?
  // Without this check, I can't destructure below 👀
  if (!response) {
    console.log('response be void I guess');
    return;
  }

  const { request: solution } = response;

  console.log(`here be the solution: ${solution}`);
  return;

  // TODO: parse response, click tiles as per response, submit solution
};
*/
