const express = require('express');

const router = express.Router();

router.use('/', express.static('data/audio'));

module.exports = { audio: router };
