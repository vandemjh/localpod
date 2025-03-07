const ollama = require('ollama').default;
const { logger } = require('./logger');
const os = require('os');

const TEXT_CUTOFF = 1_000;
const RETRIES = 5;

/** @typedef {{ title: string, description: string }} Metadata */

/** @returns {Promise<Metadata>} */
const generateMetadata = async (text, filename) => {
  if (!process.env.USE_LLM) {
    return {
      title: filename,
      description: text.substring(0, TEXT_CUTOFF) + '...',
    };
  }
  logger.log(`Generating metadata for text of length: ${text.length}`);

  let cutoff = false;
  if (text.length >= TEXT_CUTOFF) {
    cutoff = true;
    text = text.substring(0, TEXT_CUTOFF);
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
    model: 'llama3.2',
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

  logger.log(`Metadata query took: ${(new Date() - prev) / 1000} seconds`);

  return JSON.parse(response.message.content);
};

const NUMBER_OF_CHARS = 5_000;

const cleanArticle = async (text) => {
  if (!process.env.USE_LLM) {
    return text;
  }
  text = text.replaceAll(os.EOL, ' ');
  const split = text.split('.');
  const toPrompt = [];
  let temp = '';
  for (const i of split) {
    if (temp.length + i.length < NUMBER_OF_CHARS) {
      temp += i + '.';
    } else {
      toPrompt.push(temp);
      temp = '';
    }
  }
  toPrompt.push(temp);

  logger.debug(`Cleaning article in ${toPrompt.length} parts`);

  const ask = async (i) => {
    const prompt = `You are a text-cleaning assistant. Your job is to remove unwanted artifacts while keeping the full article text intact. Given an article snippet (max ${NUMBER_OF_CHARS} characters) return the cleaned text following these rules:
    
    ### **Rules:**
- **Remove:** URLs, timestamps, headers, footers, section headings like "RECOMMENDED READING."
- **Fix:** OCR errors (e.g., "e" → "The").
- **DO NOT:** Summarize, rewrite, or shorten the content. Keep the original text as it is as much as possible.

Return ONLY the cleaned article. No other commentary.

### **Article:**
${i}
`;
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.message.content;
  };

  const promises = toPrompt.map((i) => ask(i));
  return (await Promise.all(promises)).join(' ');
};

module.exports = { generateMetadata, cleanArticle };
