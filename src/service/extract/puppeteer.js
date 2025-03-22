const { logger } = require('../logger');

const puppeteer = require('puppeteer');
const { saveArticle } = require('./pdf');

const TIMEOUT = 5_000;

/** @returns {Promise<import('.').Article>} */
const extractArticleFromURL = async (url, filename) => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    // executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  );
  logger.log(`Requesting article (timeout of ${TIMEOUT})`);
  await page.goto(url, { waitUntil: 'networkidle2' }); // Ensures JS loads
  await page.waitForSelector('article p', { timeout: TIMEOUT });

  const pTagPromise = page.evaluate(() => {
    const articles = document.querySelectorAll('article');

    let maxParagraphCount = 0;
    let articleWithMostParagraphs = articles[0];

    articles.forEach((article) => {
      const paragraphCount = article.querySelectorAll('p').length;

      if (paragraphCount > maxParagraphCount) {
        maxParagraphCount = paragraphCount;
        articleWithMostParagraphs = article;
      }
    });

    const res = articleWithMostParagraphs
      ? articleWithMostParagraphs.querySelectorAll('p')
      : [];
    return [...res].map((i) => i.textContent);
  });
  const titlePromise = page.title();

  const [pTags, title] = await Promise.all([pTagPromise, titlePromise]);

  const paragraphs = [...pTags]
    .map((i) => i?.trim().replaceAll(/\s+/g, ' ') || '')
    .filter(Boolean);

  const text = paragraphs.join('\n');

  const metadata = { title };

  logger.log(`Retrieved article with ${paragraphs.length} paragraphs`);
  saveArticle(text, filename);
  await browser.close();
  return { paragraphs, metadata };
};

module.exports = { extractArticleFromURL, saveArticle };
