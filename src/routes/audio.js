const express = require('express');

const router = express.Router();

router.use('/', express.static('audio'));

module.exports = { audio: router };
