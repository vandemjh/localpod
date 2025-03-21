const express = require('express');
const multer = require('multer');
const { Worker } = require('worker_threads');
const { logger } = require('../service/logger');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.use('/', express.static('src/public'));

router.post('/', upload.single('pdf'), (req, res) => {
  const { articleLink } = req.body;
  const { file } = req;
  if (!file && !articleLink) {
    res.status(400).send('No file or article link provided');
    return;
  }

  if (file) {
    logger.log(`Received file ${file.filename}`);
  }
  if (articleLink) {
    const url = new URL(articleLink);
    logger.log(`Received article ${url.host}...`);
  }

  const worker = new Worker('./src/service/worker.js', {
    workerData: { file, articleLink },
  });

  worker.on('message', (message) => logger.log(`Worker: ${message}`));
  worker.on('error', (err) => logger.error(`Worker Error: ${err}\n${err.stack}`));
  worker.on('exit', (code) => {
    if (code !== 0) logger.log(`Worker stopped with exit code ${code}`);
  });

  res.redirect('/rss');
});

module.exports = { upload: router };
