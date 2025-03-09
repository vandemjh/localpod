const { logger } = require('./logger');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const os = require('os');

const puppeteer = require('puppeteer');

const TIMEOUT = 5_000;

/** @typedef {{ paragraphs: string[], title: string }} Article */

const saveArticle = (text, f) => {
  if (!process.env.DEBUG) return;
  const filename = `./articles/${f}.txt`;
  return fs.writeFile(filename, text, () => {
    logger.log(`Saved to ${filename}`);
  });
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
  const pTagPromise = page.evaluate(() =>
    Array.from(document.querySelectorAll('article p')).map((p) => {
      const attributeNames = p.getAttributeNames();
      const pAttributes = {};
      attributeNames.forEach((i) => (pAttributes[i] = p.getAttribute(i)));
      pAttributes.textContent = p.textContent;
      return pAttributes;
    }),
  );
  const titlePromise = page.title();

  const [pTags, title] = await Promise.all([pTagPromise, titlePromise]);

  const paragraphs = pTags.map((i) =>
    i.textContent.trim().replaceAll(/\s+/g, ' '),
  );

  const text = paragraphs.join('\n');

  logger.log(`Retrieved article with ${paragraphs.length} paragraphs`);
  saveArticle(text, filename);
  await browser.close();
  return { paragraphs, title };
};

/** @returns {Promise<Article>} */
const extractArticleFromPDF = async (file, filename) => {
  const dataBuffer = fs.readFileSync(file.path);
  fs.unlinkSync(file.path);
  const title = file.title;
  let { text } = await pdfParse(dataBuffer);

  const paragraphs = text.split(os.EOL + os.EOL).filter(Boolean);

  saveArticle(text, filename);
  return { paragraphs, title };
};

module.exports = { extractArticleFromURL, extractArticleFromPDF, saveArticle };
