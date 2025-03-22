/** @returns {Promise<string>} */
const speak = (text, filename) => {
  const providers = {
    gtts: require('./gtts'),
    kokoro: require('./kokoro'),
  };
  return providers[process.env.TTS || 'kokoro'].speak(text, filename);
}

module.exports = { speak };
