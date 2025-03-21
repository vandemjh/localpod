const os = require('os');
const ollama = require('ollama').default;
const { logger } = require('../logger');

const { constants } = require('../constants');

/**
 * @param {string} text
 * @param {string} prompt
 * @returns {Promise<string>}
 */
const promptOllama = async (text, prompt) => {
  if (!constants.USE_LLM) {
    return text;
  }
  text = text.replaceAll(os.EOL, ' ');
  const split = text.split('.'); // Split to sentences
  const toPrompt = [];
  let temp = '';
  for (const i of split) {
    // Cut off for context window
    if (temp.length + i.length < constants.LLM_CONTEXT_WINDOW) {
      temp += i + '.';
    } else {
      toPrompt.push(temp);
      temp = '';
    }
  }
  toPrompt.push(temp);

  const ask = async (text, index) => {
    const content = `${prompt}\n${text}`;

    logger.debug(`Prompting part ${index} / ${toPrompt.length}`);

    const response = await ollama.chat({
      model: constants.MODEL_NAME,
      messages: [{ role: 'user', content }],
      options: {
        temperature: 0.25,
      },
    });

    logger.debug(`Finished prompting part ${index} / ${toPrompt.length}`);

    return response.message.content;
  };

  const promises = toPrompt.map((i, index) => ask(i, index + 1));
  return (await Promise.all(promises)).join(' ');
};

module.exports = { promptOllama };
