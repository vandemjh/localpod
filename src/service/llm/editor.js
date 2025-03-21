const os = require('os');
const ollama = require('ollama').default;
const { logger } = require('../logger');

const { constants } = require('../constants');
const { promptOllama } = require('./prompt');

const prompt = `You are a text-cleaning assistant. Your job is to remove unwanted artifacts while keeping the full article text intact. Given an article snippet (max ${constants.LLM_CONTEXT_WINDOW} characters) return the cleaned text following these rules:

### **Rules:**
- **Remove:** URLs, timestamps, headers, footers, section headings like "RECOMMENDED READING."
- **Fix:** OCR errors (e.g., "e" → "The").
- **DO NOT:** Summarize, rewrite, or shorten the content. Keep the original text as it is as much as possible.

Return ONLY the cleaned article. No other commentary.
### **Article:**`;

const getPrompt = (p, text) => `${p ? p : prompt}${text}`;

/**
 * @param {string} text
 * @param {string | undefined} prompt Optional prompt to use to clean
 * @returns {Promise<string>}
 */
const cleanArticle = async (text, prompt = undefined) => {
  return promptOllama(text, getPrompt(prompt, text));
};

module.exports = { cleanArticle, _prompt: prompt };
