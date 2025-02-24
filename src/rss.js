const express = require('express');
const RSS = require('rss');
const { feedService } = require('./service/feed');
const { getHostname, getFullURL } = require('./service/host');

const router = express.Router();

router.get('/', (req, res) => {
  const feed = new RSS({
    title: 'PDF Transcriptions',
    description: 'RSS feed of uploaded PDF transcriptions with audio',
    feed_url: `${getHostname()}/rss`,
    site_url: `${getHostname()}`,
    image_url: `${getFullURL()}/localcast.png`
  });

  feedService.getFeed().forEach((item) => feed.item(item));

  res.set('Content-Type', 'application/xml');
  res.send(feed.xml());
});

module.exports = { rss: router };
