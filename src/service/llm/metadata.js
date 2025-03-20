const ollama = require('ollama').default;
const { constants } = require('../constants');
const { logger } = require('../logger');

/** @typedef {{ title: string, description: string }} Metadata */

/** @returns {Promise<Metadata>} */
const generateMetadata = async (text, title) => {
  if (!constants.USE_LLM) {
    return {
      title,
      description: text.substring(0, constants.TEXT_CUTOFF) + '...',
    };
  }
  logger.log(`Generating metadata for text of length: ${text.length}`);

  let cutoff = false;
  if (text.length >= constants.TEXT_CUTOFF) {
    cutoff = true;
    text = text.substring(0, constants.TEXT_CUTOFF);
  }

  const prompt = `You are an assistant that summarizes articles for RSS feeds.
    Given an article${cutoff ? ' which has been truncated' : ''}, generate:
    1. A short but engaging title.
    2. A 2-3 sentence description summarizing the article.
    3. The article's author (if possible).

    Article:
    ${text}`;

  const prev = new Date();
  const response = await ollama.chat({
    model: constants.MODEL_NAME,
    messages: [{ role: 'user', content: prompt }],
    format: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        author: {
          type: 'string',
        },
      },
      required: ['title', 'description'],
    },
  });

  logger.log(
    `Metadata query took: ${(new Date().getTime() - prev.getTime()) / 1000} seconds`,
  );

  return JSON.parse(response.message.content);
};

module.exports = { generateMetadata };
