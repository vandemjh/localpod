const gTTS = require('gtts');

const speak = async (text, filename) => {
  const tts = new gTTS(text, 'en');
  const audioPath = `./uploads/${filename}.mp3`;
  return new Promise((res, rej) => {
    tts.save(audioPath, (err) => {
      if (err) {
        console.error('Error generating TTS:', err);
        rej(err);
      }
      res(audioPath);
    });
  });
};

module.exports = { speak };
