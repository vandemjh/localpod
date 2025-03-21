const { logger } = require('../logger');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const os = require('os');

const puppeteer = require('puppeteer');
const { saveArticle } = require('./pdf');

const TIMEOUT = 5_000;

/** @returns {Promise<import('.').Article>} */
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
  // [...document.querySelectorAll('article p')]
  //   .map((p) => {
  //     if (!(p instanceof HTMLElement)) return;
  //     let current = p;
  //     const hierarchy = [];

  //     while (current && current.tagName.toLowerCase() !== 'article') {
  //       hierarchy.push(current);
  //       if (!current.parentElement) break;
  //       current = current.parentElement;
  //     }

  //     if (current) hierarchy.push(current);

  //     return hierarchy.reverse();
  //   })
  //   .map((i) =>
  //     i
  //       ?.map((p) => {
  //         const attributeNames = p.getAttributeNames();
  //         const pAttributes = {};
  //         attributeNames.forEach((i) => (pAttributes[i] = p.getAttribute(i)));
  //         if (p.tagName.toLowerCase() === 'p') {
  //           pAttributes.textContent = p.textContent;
  //           pAttributes.element = p;
  //         }
  //         return pAttributes;
  //       })
  //       .filter(Boolean),
  //   ),
  // );
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

  console.log('pTags', pTags);

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
