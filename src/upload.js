const express = require('express');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const multer = require('multer');
const gTTS = require('gtts');
const { feedService } = require('./service/feed');
const { generateMetadata } = require('./service/editor');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

const articles = {};

router.get('/', express.static('src/public'));

router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  res.redirect('/upload');
  // Server renders info...

  const dataBuffer = fs.readFileSync(req.file.path);
  const pdfData = await pdfParse(dataBuffer);
  const metadata = await generateMetadata(pdfData.text);

  fs.unlinkSync(req.file.path);

  const id = req.file.filename;
  articles[id] = pdfData.text;

  // const tts = new gTTS(pdfData.text, 'en');
  // const audioPath = `uploads/${id}.mp3`;
  // tts.save(audioPath, (err) => {
  //   if (err) console.error('Error generating TTS:', err);
  // });

  const item = {
    ...metadata,
    url: `http://localhost:3000/articles/${id}`,
    enclosure: {
      url: `http://localhost:3000/audio/${id}.mp3`,
      type: 'audio/mpeg',
    },
    date: new Date(),
  };
  const newFeed = feedService.getFeed();
  newFeed.push(item);
  feedService.saveFeed(newFeed);
});

module.exports = { upload: router };
