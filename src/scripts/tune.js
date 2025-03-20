const fs = require('fs');
const path = require('path');
const levenshtein = require('fast-levenshtein');
const ollama = require('ollama').default;
const { cleanArticle } = require('../service/llm');
const { constants } = require('../service/constants');
const { logger } = require('../service/logger');
const { _prompt } = require('../service/llm/editor');

const trainDir = './train';
const maxIterations = 1;

const format = {
  type: 'object',
  properties: {
    prompt: {
      type: 'string',
    },
  },
};

const loadText = (filename) =>
  fs.readFileSync(path.join(trainDir, filename), 'utf8').trim();

const evaluate = (cleaned, aiOutput) => {
  const distance = levenshtein.get(cleaned, aiOutput);
  const maxLen = Math.max(cleaned.length, aiOutput.length);
  const similarity = 1 - distance / maxLen;
  return { distance, similarity };
};

const generatePrompt = async (previousPrompt, results) => {
  const feedback = results
    .map((r) => `Article ${r.article}: similarity ${r.similarity.toFixed(2)}`)
    .join('\n');
  const response = await ollama.chat({
    model: constants.MODEL_NAME,
    format,
    messages: [
      {
        role: 'user',
        content: `The following prompt is being used for cleaning article text:

${previousPrompt}

Recent evaluation results:
${feedback}

Based on these results, refine the prompt to improve general accuracy without altering the meaning of the cleaned text.`,
      },
    ],
  });
  return JSON.parse(response.message.content).prompt.trim();
};

(async () => {
  const articles = [1, 2, 3];
  let basePrompt = _prompt;

  for (let iter = 0; iter < maxIterations; iter++) {
    logger.log(`Iteration ${iter + 1} with prompt:\n${basePrompt}\n---`);

    const results = [];
    for (const i of articles) {
      const raw = loadText(`text${i}.txt`);
      const cleaned = loadText(`text-cleaned${i}.txt`);

      const aiOutput = await cleanArticle(raw, basePrompt);
      fs.writeFileSync(path.join(trainDir, `ai-cleaned-${i}.txt`), aiOutput);
      const { distance, similarity } = evaluate(cleaned, aiOutput);

      results.push({ article: i, distance, similarity });
    }

    logger.log('Evaluation Results:', results);

    const avgSimilarity =
      results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
    if (avgSimilarity >= 0.95) break;

    basePrompt = await generatePrompt(basePrompt, results);
  }
})();
