const express = require('express');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const multer = require('multer');
const gTTS = require('gtts');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.use(express.static('public'));

const articles = {};
const feedItems = [];

const file = fs.readFileSync('./frontend/index.html').toString();
router.get('/', (req, res) => {
  res.send(file);
});

router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  const dataBuffer = fs.readFileSync(req.file.path);
  const pdfData = await pdfParse(dataBuffer);

  fs.unlinkSync(req.file.path);

  const id = req.file.filename;
  articles[id] = pdfData.text;

  const tts = new gTTS(pdfData.text, 'en');
  const audioPath = `uploads/${id}.mp3`;
  tts.save(audioPath, (err) => {
    if (err) console.error('Error generating TTS:', err);
  });

  const item = {
    title: req.file.originalname,
    description: pdfData.text.substring(0, 200) + '...', // Truncate text for RSS
    url: `http://localhost:3000/articles/${id}`,
    enclosure: {
      url: `http://localhost:3000/audio/${id}.mp3`,
      type: 'audio/mpeg',
    },
    date: new Date(),
  };
  feedItems.push(item);

  res.redirect('/upload');
});

module.exports = { upload: router };
