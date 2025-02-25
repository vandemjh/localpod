const { KokoroTTS } = require('kokoro-js');

const model_id = 'onnx-community/Kokoro-82M-v1.0-ONNX';
let tts;
(async () => {
  tts = await KokoroTTS.from_pretrained(model_id, {
    dtype: 'q8', // Options: "fp32", "fp16", "q8", "q4", "q4f16"
    device: 'cpu', // Options: "wasm", "webgpu" (web) or "cpu" (node). If using "webgpu", we recommend using dtype="fp32".
  });
})();

const speak = async (text, filename) => {
  const audioPath = `./uploads/${filename}.wav`
  const audio = await tts.generate(text, {
    // Use `tts.list_voices()` to list all available voices
    voice: 'af_alloy',
  });
  await audio.save(audioPath);
  return audioPath;
};

module.exports = { speak };
