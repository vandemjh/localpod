const {
  extractArticleFromURL: puppeteerExtractArticleFromURL,
} = require('./puppeteer');
const { extractArticleFromURL } = require('./article-extractor');
const { constants } = require('../constants');

/** @typedef {{ paragraphs: string[], metadata?: { author?: string, title?: string, description?: string, image?: string, published?: string } }} Article */

module.exports = {
  extractorService: {
    extractArticleFromURL: (...args) =>
      constants.USE_PUPPETEER
        ? puppeteerExtractArticleFromURL(...args)
        : extractArticleFromURL(...args),
  },
};
