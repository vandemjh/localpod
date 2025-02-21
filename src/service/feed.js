const fs = require('fs');

const fileName = './feed.json';

const getFeed = () => {
  if (!fs.existsSync(fileName)) return [];
  try {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
  } catch (e) {
    console.error('Error reading feed file:', e);
    return [];
  }
};

const saveFeed = (feed) => {
  try {
    fs.writeFileSync(fileName, JSON.stringify(feed, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving feed file:', e);
  }
};

module.exports = { feedService: { getFeed, saveFeed } };
