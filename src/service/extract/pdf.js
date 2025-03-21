const { logger } = require('../logger');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const os = require('os');

const saveArticle = (text, f) => {
  if (!process.env.DEBUG) return;
  const filename = `./data/articles/${f}.txt`;
  return fs.writeFile(filename, text, () => {
    logger.log(`Saved to ${filename}`);
  });
};

/**
 * @param {Express.Multer.File} file
 * @returns {Promise<import('.').Article>}
 */
const extractArticleFromPDF = async (file, filename) => {
  const dataBuffer = fs.readFileSync(file.path);
  fs.unlinkSync(file.path);
  const title = file.originalname;
  let { text } = await pdfParse(dataBuffer);

  const metadata = { title };

  const paragraphs = text.split(os.EOL + os.EOL).filter(Boolean);

  saveArticle(text, filename);
  return { paragraphs, metadata };
};

module.exports = { extractArticleFromPDF, saveArticle };
