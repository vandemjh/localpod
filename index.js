const express = require('express');

const { upload } = require('./src/upload');
const { rss } = require('./src/rss');
const { audio } = require('./src/audio');

const app = express();

app.use('/upload', upload);
app.use('/rss', rss);
app.use('/audio', audio);

app.listen(3000, () => console.log('Server running on port 3000'));
