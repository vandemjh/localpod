require('dotenv').config();
const express = require('express');

const { upload } = require('./src/routes/upload');
const { rss } = require('./src/routes/rss');
const { audio } = require('./src/routes/audio');
const { getPort, getFullURL } = require('./src/service/host');

const app = express();

app.use('/', upload);
app.use('/rss', rss);
app.use('/audio', audio);

app.listen(getPort(), () => console.log(`Server running on ${getFullURL()}`));
