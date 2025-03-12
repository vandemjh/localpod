const express = require('express');
const RSS = require('rss');
const { feedService } = require('../service/feed');
const { getFullURL, getProto, getHostname } = require('../service/host');

const router = express.Router();

router.get('/', (req, res) => {
  const feed = new RSS({
    title: 'PDF Transcriptions',
    description: 'RSS feed of uploaded PDF transcriptions with audio',
    feed_url: `${getFullURL()}/rss`,
    site_url: `${getFullURL()}`,
    image_url: `${getFullURL()}/localcast.png`,
    categories: ['news'],
    ttl: 30,
  });

  feedService.getFeed().forEach((item) =>
    // @ts-ignore
    feed.item({
      ...item,
      enclosure: {
        ...item.enclosure,
        url: `${getProto()}://${getHostname()}/${item.enclosure.url}`,
      },
    }),
  );

  res.set('Content-Type', 'application/xml');
  res.send(feed.xml());
});

module.exports = { rss: router };
