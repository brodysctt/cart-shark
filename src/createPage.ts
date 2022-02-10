import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export const createPage = async () => {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    devtools: true,
  });
  const incognito = await browser.createIncognitoBrowserContext();
  return await incognito.newPage();
};
