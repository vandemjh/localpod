require('dotenv').config();
const hostname = process.env.LOCALCPOD_HOSTNAME || 'localhost';

const getHostname = () => hostname;

const getPort = () => parseInt(process.env.PORT || '') || 56225;

const getProto = () => process.env.PROTO || 'http';

const getFullURL = () => {
  const proto = getProto();
  const host = getHostname();
  const port = getPort();

  const isProduction = process.env.NODE_ENV === 'production';
  const url = isProduction
    ? `${proto}://${host}`
    : `${proto}://${host}:${port}`;

  return new URL(url).href;
};

const NUMBER_OF_CHARS = 5_000;
const TEXT_CUTOFF = 1_000;
const MODEL_NAME = 'llama3.2';

const constants = {
  NUMBER_OF_CHARS,
  TEXT_CUTOFF,
  MODEL_NAME,
  USE_LLM: process.env.USE_LLM,
};

module.exports = { getHostname, getPort, getFullURL, getProto, constants };
