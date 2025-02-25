require('dotenv').config();
const express = require('express');

const { upload } = require('./src/upload');
const { rss } = require('./src/rss');
const { audio } = require('./src/audio');
const { getHostname, getPort, getFullURL } = require('./src/service/host');

const app = express();

app.use('/', upload);
app.use('/rss', rss);
app.use('/audio', audio);

app.listen(getPort(), () => console.log(`Server running on ${getFullURL()}`));
