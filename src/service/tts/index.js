const providers = {
  gtts: require('./gtts'),
  kokoro: require('./kokoro'),
};

/** @returns {Promise<string>} */
const speak = (text, filename) =>
  providers[process.env.TTS || 'kokoro'].speak(text, filename);

module.exports = { speak };
