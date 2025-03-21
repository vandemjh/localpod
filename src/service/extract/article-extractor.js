const { logger } = require('../logger');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const os = require('os');
const { saveArticle } = require('./pdf');

/** @type {import('@extractus/article-extractor')} */
let articleExtractor;

/** @returns {Promise<import('.').Article>} */
const extractArticleFromURL = async (url, filename) => {
  await (async () => {
    articleExtractor = await import('@extractus/article-extractor');
  })();
  logger.log('Loaded article extractor');

  const articleData = await articleExtractor.extract(
    url,
    {},
    {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(5000),
    },
  );

  if (!articleData) throw new Error(`Failed to pull article from: ${url}`);

  const {
    title,
    author,
    content: htmlContent,
    description,
    image,
    published,
  } = articleData;

  const metadata = {
    author,
    title: title || filename,
    description,
    image,
    published,
  };

  if (!htmlContent) throw new Error(`Failed to pull content from: ${url}`);

  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gs;
  const matches = [...htmlContent.matchAll(paragraphRegex)];

  const paragraphs = matches
    .map((match) => {
      const content = match[1];

      const plainText = content.replace(/<[^>]*>/g, '');

      return plainText
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    })
    .filter(Boolean);

  logger.log(`Retrieved article with ${paragraphs.length} paragraphs`);
  const fullText = paragraphs.join(os.EOL + os.EOL);
  saveArticle(fullText, filename);
  return { paragraphs, metadata };
};

module.exports = { extractArticleFromURL, saveArticle };
