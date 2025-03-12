const fs = require('fs');
const { logger } = require('./logger');

const fileName = './feed.json';

/**
 * @typedef {Object} Enclosure
 * @property {string} uuid
 * @property {string} type
 * @property {string} extension
 * @property {number} size
 */

/**
 * @typedef {Object} FeedItem
 * @property {Enclosure} enclosure
 * @property {Date} date
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {FeedItem[]} Feed
 */

/** @returns {Feed} */
const getFeed = () => {
  if (!fs.existsSync(fileName)) return [];
  try {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
  } catch (e) {
    logger.error('Error reading feed file:', e);
    return [];
  }
};

/** @param {Feed} feed */
const saveFeed = (feed) => {
  try {
    fs.writeFileSync(fileName, JSON.stringify(feed), 'utf8');
  } catch (e) {
    logger.error('Error saving feed file:', e);
  }
};

module.exports = { feedService: { getFeed, saveFeed } };
