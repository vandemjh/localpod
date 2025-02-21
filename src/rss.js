const express = require('express');
const RSS = require('rss');

const router = express.Router();

router.get('/', (req, res) => {
  const feed = new RSS({
    title: 'PDF Transcriptions',
    description: 'RSS feed of uploaded PDF transcriptions with audio',
    feed_url: 'http://localhost:3000/rss',
    site_url: 'http://localhost:3000',
  });

  feedItems.forEach((item) => feed.item(item));

  res.set('Content-Type', 'application/xml');
  res.send(feed.xml());
});

module.exports = { rss: router };
