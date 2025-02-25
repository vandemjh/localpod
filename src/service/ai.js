const ollama = require('ollama').default;

const TEXT_CUTOFF = 1_000;
const RETRIES = 5;

/** @typedef {{ title: string, description: string }} Metadata */

const query = async (prompt) => {
  let result = null;
  let attempts = RETRIES;
  while (!result && attempts < 5) {
    try {
      const response = await ollama.chat({
        model: 'llama3.2',
        messages: [{ role: 'user', content: prompt }],
      });

      const output = response.message.content;
      const titleMatch = output.match(/Title:\s*(.*)/);
      const descriptionMatch = output.match(/Description:\s*(.*)/);

      result = {
        title: titleMatch[1].trim(),
        description: descriptionMatch[1].trim(),
      };
    } catch (error) {
      console.warn(
        `Error generating metadata (Attempt ${attempts + 1}):`,
        error,
      );
    }
    attempts++;
  }
  return result;
};

/** @returns {Promise<Metadata>} */
const generateMetadata = async (text, filename) => {
  if (!process.env.USE_LLM) {
    return {
      title: filename,
      description: text.substring(0, 1000) + "...",
    };
  }
  let cutoff = false;
  if (text.length >= TEXT_CUTOFF) {
    cutoff = true;
    text = text.substring(0, TEXT_CUTOFF);
  }

  const prompt = `You are an assistant that summarizes articles for RSS feeds.
    Given an article${cutoff ? ' which has been truncated' : ''}, generate:
    1. A short but engaging title.
    2. A 2-3 sentence description summarizing the article.

    Article:
    ${text}

    Format your response as:
    Title: [Generated Title]
    Description: [Generated Description]
  `;

  const result = await query(prompt);

  return (
    result || { title: 'Untitled', description: 'No description available.' }
  );
};

/** @returns {Promise<Metadata>} */
const extractArticle = async (text) => {
  if (!process.env.USE_LLM) {
    return text;
  }
  const prompt = `You are an assistant that extracts article text from a transcript.
  Given an article, extract and return just the article text in it's full form without possible transcription errors.

  Article:
  ${text}
`;
  const result = await query(prompt);
  return result;
};

module.exports = { generateMetadata, extractArticle };
