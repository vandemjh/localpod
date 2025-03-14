const express = require('express');
const RSS = require('rss');
const { feedService } = require('../service/feed');
const { getFullURL } = require('../service/host');

const router = express.Router();

// https://help.apple.com/itc/podcasts_connect/#/itcb54353390
router.get('/', (req, res) => {
  const feed = new RSS({
    title: 'PDF Transcriptions',
    description: 'RSS feed of uploaded PDF transcriptions with audio',
    feed_url: `${getFullURL()}rss`,
    site_url: `${getFullURL()}`,
    image_url: `${getFullURL()}localcast.png`,
    categories: ['news'],
    language: 'eng',
    ttl: 30,
    custom_elements: [
      `<itunes:image>${getFullURL()}localcast.png</itunes:image>`,
      // `<itunes:category>news</itunes:category>`,
    ],
  });

  const getUrl = (uuid, extension, audioFolder = './data/audio') =>
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
