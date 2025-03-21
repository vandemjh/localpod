const fs = require('fs');
const { logger } = require('./logger');
const { feedService } = require('./feed');
const { generateMetadata, cleanArticle } = require('./llm');
const { speak } = require('./tts');
const { randomUUID } = require('crypto');
const { extractArticleFromPDF, saveArticle } = require('./extract/pdf');
const { extractorService } = require('./extract');
const { title } = require('process');
const { constants } = require('./constants');
const { podify } = require('./llm/podify');

const toRemoveAny = [
  /SHARE AS GIFT/g, // Atlantic share with
  /RECOMMENDED READING/g, // Atlantic reccomended reading
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, // URLs
];

const toRemoveFull = [/Advertisement/g, /Supported by/g, /COLLAPSE/g];

let musicMetadata;
(async () => {
  musicMetadata = await import('music-metadata');
})();

const process = async (file, articleLink) => {
  const isPdf = !!file;
  const filename = randomUUID();
  let paragraphs = [];
  let articleMetadata;
  if (file) {
    ({ paragraphs, metadata: articleMetadata } = await extractArticleFromPDF(
      file,
      filename,
    ));
  }
  if (articleLink) {
    ({ paragraphs, metadata: articleMetadata } =
      await extractorService.extractArticleFromURL(articleLink, filename));
  }

  paragraphs = paragraphs.filter(
    (str) =>
      !toRemoveFull.some((regex) => {
        regex.lastIndex = 0;
        return regex.test(str);
      }),
  );

  let text = paragraphs.join('\n');

  logger.log(
    `Parsed text of size: ${text.length} with ${text.split('\n').length} lines`,
  );

  // Remove toRemove regex
  for (const i of toRemoveAny) {
    text = text.replaceAll(i, '');
  }

  logger.log(`Cleaned with regex to size: ${text.length}`);

  // Clean article of OCR errors, etc
  if (isPdf) {
    text = await cleanArticle(text);
    logger.log(`Cleaned to size: ${text.length}`);
  }
  if (constants.PODIFY) {
    text = await podify(text);
  }
  saveArticle(text, `${filename}-cleaned`);

  // Fire up those cores!
  let [metadata, audioPath] = await Promise.all([
    generateMetadata(text, title),
    speak(text, filename),
  ]);

  metadata = { ...metadata, ...articleMetadata };

  const audioData = await musicMetadata.parseFile(audioPath);

  const item = {
    ...metadata,
    enclosure: {
      uuid: filename,
      extension: 'wav',
      type: 'audio/mpeg',
      size: audioData.format.duration,
    },
    date: new Date(),
  };
  const newFeed = feedService.getFeed();
  newFeed.push(item);
  feedService.saveFeed(newFeed);
};

module.exports = { process };
