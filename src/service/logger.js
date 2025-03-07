const util = require('util');
const path = require('path');

const MAX_LENGTH = 16;

const getStarter = () => {
  const callsites = Error.prepareStackTrace;
  const err = new Error();
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = err.stack[2];

  Error.prepareStackTrace = callsites;
  const caller = stack.getFileName();
  const line = stack.getLineNumber();
  const col = stack.getLineNumber();
  const basename = path.basename(caller);
  const starter = `${basename}:${line}:${col}`.padEnd(MAX_LENGTH, ' ');
  return starter;
};

const logger = {
  debug: (...s) => {
    const starter = getStarter();
    console.debug(`[${starter}]:`, ...s);
  },
  log: (...s) => {
    // const callsites = util.getCallSites(2); // Not available yet
    const starter = getStarter();
    console.log(`[${starter}]:`, ...s);
  },
};

module.exports = { logger };
