import * as puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ devtools: true });
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
        await page.keyboard.type('test@test.com');
      }
      if (input.match(/^password/g)) {
        await page.focus(`#${input}`);
        await page.keyboard.type('password');
      }
    }

    await page.click('button[type=submit]');

    await incognito.close();
  } catch (err) {
    console.error(err);
  }
})();
