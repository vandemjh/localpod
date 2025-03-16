const { logger } = require('./logger');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const os = require('os');

/** @type {import('@extractus/article-extractor')} */
let articleExtractor;

/** @typedef {{ paragraphs: string[], title: string, metadata?: object }} Article */

const saveArticle = (text, f) => {
  if (!process.env.DEBUG) return;
  const filename = `./data/articles/${f}.txt`;
  return fs.writeFile(filename, text, () => {
    logger.log(`Saved to ${filename}`);
  });
};

/** @returns {Promise<Article>} */
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
    content: text,
    description,
    image,
    published,
  } = articleData;

  if (!text) throw new Error(`Failed to pull content from: ${url}`);

  const paragraphs = text.split(os.EOL + os.EOL).filter(Boolean);

  logger.log(`Retrieved article with ${text.length} paragraphs`);
  saveArticle(text, filename);
  return { paragraphs, title: title || filename, metadata: articleData };
};

/**
 * @param {Express.Multer.File} file
 * @returns {Promise<Article>}
 */
const extractArticleFromPDF = async (file, filename) => {
  const dataBuffer = fs.readFileSync(file.path);
  fs.unlinkSync(file.path);
  const title = file.originalname;
  let { text } = await pdfParse(dataBuffer);

  const paragraphs = text.split(os.EOL + os.EOL).filter(Boolean);

  saveArticle(text, filename);
  return { paragraphs, title };
};

module.exports = { extractArticleFromURL, extractArticleFromPDF, saveArticle };
