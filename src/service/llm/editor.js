const os = require('os');
const ollama = require('ollama').default;
const { logger } = require('../logger');

const { constants } = require('../constants');

const prompt = `You are a text-cleaning assistant. Your job is to remove unwanted artifacts while keeping the full article text intact. Given an article snippet (max ${constants.NUMBER_OF_CHARS} characters) return the cleaned text following these rules:

### **Rules:**
- **Remove:** URLs, timestamps, headers, footers, section headings like "RECOMMENDED READING."
- **Fix:** OCR errors (e.g., "e" → "The").
- **DO NOT:** Summarize, rewrite, or shorten the content. Keep the original text as it is as much as possible.

Return ONLY the cleaned article. No other commentary.
### **Article:**
`

const getPrompt = (p, text) =>
  `${p ? p : prompt}${text}`;

/**
 * @param {string} text 
 * @param {string | undefined} prompt Optional prompt to use to clean
 * @returns {Promise<string>}
 */
const cleanArticle = async (text, prompt) => {
  if (!constants.USE_LLM) {
    return text;
  }
  text = text.replaceAll(os.EOL, ' ');
  const split = text.split('.'); // Split to sentences
  const toPrompt = [];
  let temp = '';
  for (const i of split) {
    // Cut off for context window
    if (temp.length + i.length < constants.NUMBER_OF_CHARS) {
      temp += i + '.';
    } else {
      toPrompt.push(temp);
      temp = '';
    }
  }
  toPrompt.push(temp);

  logger.debug(`Cleaning article in ${toPrompt.length} parts`);

  const ask = async (text) => {
    const content = getPrompt(prompt, text);

    logger.debug(`Cleaning part ${text.substring(0, 50)}`)

    const response = await ollama.chat({
      model: constants.MODEL_NAME,
      messages: [{ role: 'user', content }],
      options: {
        temperature: 0.25
      }
    });

    return response.message.content;
  };

  const promises = toPrompt.map((i) => ask(i));
  return (await Promise.all(promises)).join(' ');
};

module.exports = { cleanArticle, _prompt: prompt };
