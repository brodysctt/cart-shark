import * as puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ devtools: true });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.goto('https://www.instacart.ca/');
  await page.click('span.css-utfnc');
  await context.close();
})();
