const express = require('express');
const multer = require('multer');
const { logger } = require('../service/logger');
const { process } = require('../service/process');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.use('/', express.static('src/public'));

router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  logger.log(`Recieved ${req.file.filename}`);

  res.redirect('/rss');
  // Server renders info...

  process(req);
});

module.exports = { upload: router };
