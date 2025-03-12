const express = require('express');
const RSS = require('rss');
const { feedService } = require('../service/feed');
const { getFullURL } = require('../service/host');

const router = express.Router();

router.get('/', (req, res) => {
  const feed = new RSS({
    title: 'PDF Transcriptions',
    description: 'RSS feed of uploaded PDF transcriptions with audio',
    feed_url: `${getFullURL()}rss`,
    site_url: `${getFullURL()}`,
    image_url: `${getFullURL()}localcast.png`,
    categories: ['news'],
    ttl: 30,
  });

  const getUrl = (uuid, extension, audioFolder = './audio') =>
    new URL(`${getFullURL()}${audioFolder}/${uuid}.${extension}`).href;

  feedService.getFeed().forEach((item) =>
    // @ts-ignore
    feed.item({
      ...item,
      enclosure: {
        ...item.enclosure,
        url: getUrl(item.enclosure.uuid, item.enclosure.extension),
      },
    }),
  );

  res.set('Content-Type', 'application/xml');
  res.send(feed.xml());
});

module.exports = { rss: router };
