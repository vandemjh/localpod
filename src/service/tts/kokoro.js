const { KokoroTTS, TextSplitterStream } = require('kokoro-js');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { logger } = require('../logger');

const model_id = 'onnx-community/Kokoro-82M-v1.0-ONNX';

/** @type {KokoroTTS} */
let tts;
(async () => {
  tts = await KokoroTTS.from_pretrained(model_id, {
    dtype: 'q8', // Options: "fp32", "fp16", "q8", "q4", "q4f16"
    device: 'cpu', // Options: "wasm", "webgpu" (web) or "cpu" (node). If using "webgpu", we recommend using dtype="fp32".
  });
})();

/** @param {string} text, @param {string} filename */
const speak = async (text, filename) => {
  const savePath = `./data/audio/${filename}.wav`;
  // First, set up the stream
  const splitter = new TextSplitterStream();
  const stream = tts.stream(splitter, {
    voice: 'af_alloy',
    speed: 1,
    // splitPattern
  });

  const tokens = text.match(/\s*\S+/g);
  if (!tokens) throw new Error(`Found empty input`);
  // const tokens = text.split('\n').filter(Boolean);
  for (const token of tokens) {
    if (token.includes('https://')) continue; // The stream breaks on links
    splitter.push(' ' + token.trim());
  }
  logger.log(`Added ${tokens.length} tokens`);
  splitter.close();

  let i = 0;
  const paths = [];
  for await (const { audio } of stream) {
    const path = `${savePath}-${i++}.wav`;
    paths.push(path);
    audio.save(path);
    logger.log(`TTS saved to ${path}`);
  }
  logger.log(`Completed stream`);

  await concatWavFiles(paths, savePath);
  return savePath;
};

/** @param {string[]} inputFiles */
const concatWavFiles = async (inputFiles, outputFile) => {
  logger.log(`Concatenating ${inputFiles.length} files`);
  if (inputFiles.length === 0) {
    logger.error('No input files provided.');
    return;
  }

  let op = ffmpeg();

  inputFiles.forEach((file) => op.input(file));

  await new Promise((res, rej) => {
    op.on('end', () => {
      logger.log(`Concatenation complete: ${outputFile}`);
      res(outputFile);
    })
      .on('error', (err) => {
        logger.error('Error:', err);
        rej(err);
      })
      .mergeToFile(outputFile, `./audio`);
  });

  // Remove temp files, fails for the async function maybe because inputFiles is garbage collected
  inputFiles.forEach((i) => fs.rmSync(i));
  logger.log(`Removed ${inputFiles.length} files`);
};

module.exports = { speak };
