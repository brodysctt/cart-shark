import * as dotenv from 'dotenv';

dotenv.config();
const { EMAIL, PASSWORD } = process.env;

export const navigateToRecaptcha = async (page) => {
  await page.goto('https://www.instacart.ca/');
  await page.click('span.css-utfnc');
  await page.click('span.css-utfnc');
  await page.waitForSelector('#auth-heading');
  await page.keyboard.type(EMAIL);
  await page.keyboard.press('Tab');
  await page.keyboard.type(PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForTimeout(5000);

  const recaptchaFrames = await page
    .mainFrame()
    .childFrames()
    .filter((f) => f.url().match(/.recaptcha\/api2\/bframe/g));

  return recaptchaFrames;
};
