const express = require('express');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const multer = require('multer');
const gTTS = require('gtts');
let musicMetadata;
(async () => {
  musicMetadata = await import('music-metadata');
})();
const { feedService } = require('./service/feed');
const { generateMetadata } = require('./service/ai');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.use('/', express.static('src/public'));

router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  res.redirect('/rss');
  // Server renders info...

  const dataBuffer = fs.readFileSync(req.file.path);
  const pdfData = await pdfParse(dataBuffer);
  const metadata = await generateMetadata(pdfData.text, req.file.filename);

  fs.unlinkSync(req.file.path);

  const id = req.file.filename;

  const tts = new gTTS(pdfData.text, 'en');
  const audioPath = `./uploads/${id}.mp3`;
  await new Promise((res, rej) => {
    tts.save(audioPath, (err) => {
      if (err) {
        console.error('Error generating TTS:', err);
        rej(err);
      }
      res();
    });
  });

  const audioData = await musicMetadata.parseFile(audioPath);
  console.log('Processed audioData', audioData);

  const item = {
    ...metadata,
    enclosure: {
      url: `/audio/${id}.mp3`,
      type: 'audio/mpeg',
      size: audioData.format.duration,
    },
    date: new Date(),
  };
  const newFeed = feedService.getFeed();
  newFeed.push(item);
  feedService.saveFeed(newFeed);
});

module.exports = { upload: router };
