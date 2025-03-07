const express = require('express');

const router = express.Router();

router.use('/', express.static('uploads'));

module.exports = { audio: router };
