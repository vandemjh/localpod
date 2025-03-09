const { logger } = require('./logger');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const puppeteer = require('puppeteer');

const TIMEOUT = 5_000;

/** @typedef {{ text: string, title: string }} Article */

const saveArticle = (text, filename) => {
  if (!process.env.DEBUG) return;
  return fs.writeFile(`./articles/${filename}.txt`, text);
};

/** @returns {Promise<Article>} */
const extractArticleFromURL = async (url, filename) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  );
  logger.log(`Requesting article (timeout of ${TIMEOUT})`);
  await page.goto(url, { waitUntil: 'networkidle2' }); // Ensures JS loads
  await page.waitForSelector('article p', { timeout: TIMEOUT });

  // <p> text inside <article>
  const textPromise = page.evaluate(() =>
    Array.from(document.querySelectorAll('article p'))
      .map((p) => p.textContent.trim().replaceAll(/\s+/g, ' '))
      .join('\n'),
  );
  const titlePromise = page.title();

  let [text, title] = await Promise.all([textPromise, titlePromise]);

  logger.log(
    `Retrieved article of size ${text.length}: ${title.substring(0, 10)}...`,
  );
  saveArticle(text, filename);
  await browser.close();
  return { text, title };
};

/** @returns {Promise<Article>} */
const extractArticleFromPDF = async (file) => {
  const dataBuffer = fs.readFileSync(file.path);
  fs.unlinkSync(file.path);
  const title = file.title;
  let { text } = await pdfParse(dataBuffer);

  saveArticle(text, filename);
  return { text, title };
};

module.exports = { extractArticleFromURL, extractArticleFromPDF, saveArticle };
