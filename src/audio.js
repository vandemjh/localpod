const express = require('express');
const fs = require('fs');
const path = require('path')

const router = express.Router();

router.get('/:id.mp3', (req, res) => {
  const filePath = `uploads/${req.params.id}.mp3`;
  if (!fs.existsSync(filePath)) return res.status(404).send('Audio not found');
  res.sendFile(path.resolve(filePath));
});

module.exports = { audio: router };
