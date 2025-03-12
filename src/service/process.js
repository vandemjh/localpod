const fs = require('fs');
const { logger } = require('./logger');
const { feedService } = require('./feed');
const { generateMetadata, cleanArticle } = require('./ai');
const { speak } = require('./tts');
const {
  extractArticleFromPDF,
  extractArticleFromURL,
  saveArticle,
} = require('./extract');
const { randomUUID } = require('crypto');

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
  let paragraphs;
  let title;
  if (file) {
    ({ paragraphs, title } = await extractArticleFromPDF(file, filename));
  }
  if (articleLink) {
    ({ paragraphs, title } = await extractArticleFromURL(
      articleLink,
      filename,
    ));
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
  saveArticle(text, `${filename}-cleaned`);

  // Fire up those cores!
  const [metadata, audioPath] = await Promise.all([
    generateMetadata(text, title),
    speak(text, filename),
  ]);

  const audioData = await musicMetadata.parseFile(audioPath);

  const item = {
    ...metadata,
    enclosure: {
      url: audioPath,
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
