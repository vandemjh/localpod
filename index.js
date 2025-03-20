require('dotenv').config();
const express = require('express');
const fs = require('fs');

const { upload } = require('./src/routes/upload');
const { rss } = require('./src/routes/rss');
const { audio } = require('./src/routes/audio');
const { getPort, getFullURL } = require('./src/service/constants');
const { logger } = require('./src/service/logger');

// Create data folders
if (!fs.existsSync('./data/audio')) {
  fs.mkdirSync('./data/audio', { recursive: true });
}
if (!fs.existsSync('./data/articles')) {
  fs.mkdirSync('./data/articles', { recursive: true });
}

const app = express();

app.use('/', upload);
app.use('/rss', rss);
app.use('/audio', audio);

app.listen(getPort(), () => logger.log(`Server running on ${getFullURL()}`));
