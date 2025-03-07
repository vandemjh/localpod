const { logger } = require('./logger');
const pdfParse = require('pdf-parse');

const puppeteer = require('puppeteer');

const TIMEOUT = 5_000;

/** @typedef {{ text: string, filename: string }} Article */

/** @returns {Promise<Article>} */
const extractArticleFromURL = async (url) => {
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
  const filenamePromise = page.title();

  let [text, filename] = await Promise.all([textPromise, filenamePromise]);
  filename = filename.toLowerCase();
  filename = filename.replaceAll(/[^a-z0-9]/gi, '');
  filename = filename.replaceAll(/\s+/gi, '-');

  logger.log(`Retrieved article of size ${text.length}: ${filename.substring(0, 10)}`);
  await browser.close();
  return { text, filename };
};

/** @returns {Promise<Article>} */
const extractArticleFromPDF = async (file) => {
  const dataBuffer = fs.readFileSync(file.path);
  fs.unlinkSync(file.path);
  const filename = file.filename;
  let { text } = await pdfParse(dataBuffer);

  return { text, filename };
};

module.exports = { extractArticleFromURL, extractArticleFromPDF };
