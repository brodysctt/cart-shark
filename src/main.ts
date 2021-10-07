import * as puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
// import { sendCaptchaRequest } from './captchas';

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
      await incognito.close();
      return;
    }

    const recaptchaChallenge = recaptchaFrames[0];

    const textInstructions = await recaptchaChallenge.$eval(
      'div.rc-imageselect-desc-no-canonical',
      (div) => {
        const childNodes = div.childNodes;
        const textArr = Array.from(childNodes, (child) => child.textContent);
        return textArr.join(' ').replace(/\s+/g, ' ');
      },
    );

    const imageURL = await recaptchaChallenge.$eval('img', (img) =>
      img.getAttribute('src'),
    );
    const encodedImage = Buffer.from(imageURL).toString('base64');
    console.log(encodedImage);

    await resolveCaptcha(encodedImage, textInstructions);

    await incognito.close();
  } catch (err) {
    console.error(err);
  }
})();

const resolveCaptcha = async (encodedImage, textInstructions) => {
  console.log(
    `here be the encoded image:
    ${encodedImage}

    and here be the text instructions:
    ${textInstructions}`,
  );
  // const response = await sendCaptchaRequest(encodedImage, textInstructions);
  // TODO: parse response, click tiles as per response, submit solution
};
