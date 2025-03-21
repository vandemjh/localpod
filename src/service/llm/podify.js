const os = require('os');
const ollama = require('ollama').default;
const { logger } = require('../logger');

const { constants } = require('../constants');
const { promptOllama } = require('./prompt');

const podifyPrompt = `Task: Rewrite the provided article to optimize it for text-to-speech (TTS) narration.

### Requirements:

* Preserve the original (max ${constants.LLM_CONTEXT_WINDOW} characters) meaning exactly—do not add, remove, or change any information.
* Expand acronyms or format them for clarity (e.g., "NASA" → "N A S A" or "National Aeronautics and Space Administration").
* Convert symbols into spoken words (e.g., "$" → "dollars", "&" → "and").
* Break up complex or lengthy sentences to improve natural speech flow while maintaining meaning.
* Ensure proper pronunciation by adding phonetic hints if necessary (e.g., "lead" → "leed" vs. "led").
* Insert natural pauses where appropriate (e.g., paragraph breaks).

### Output:

Return only the modified article, with no explanations.
Do not introduce new words, opinions, or interpretations—strictly follow the original intent.

### **Article:**`;

/**
 * @param {string} text
 * @param {string | undefined} prompt Optional prompt to use to clean
 * @returns {Promise<string>}
 */
const podify = async (text, prompt = undefined) => {
  return promptOllama(text, prompt || podifyPrompt);
};

module.exports = { podify };
