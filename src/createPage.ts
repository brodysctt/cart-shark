import puppeteer from 'puppeteer';

export const createPage = async () => {
  const browser = await puppeteer.launch({
    devtools: true,
    headless: false,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });
  const incognito = await browser.createIncognitoBrowserContext();
  return await incognito.newPage();
};
