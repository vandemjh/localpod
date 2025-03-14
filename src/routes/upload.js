const express = require('express');
const multer = require('multer');
const { logger } = require('../service/logger');
const { process } = require('../service/process');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.use('/', express.static('src/public'));

router.post('/', upload.single('pdf'), async (req, res) => {
  const { articleLink } = req.body;
  const { file } = req;
  if (!file && !articleLink) {
    res.status(400).send('No file or article link provided');
    return;
  }

  if (file) {
    logger.log(`Recieved file ${req.file?.filename}`);
  }
  if (articleLink) {
    const url = new URL(articleLink);
    logger.log(`Recieved article ${url.host}...`);
  }

  res.redirect('/rss');
  // Server renders info...

  process(file, articleLink);
});

module.exports = { upload: router };
