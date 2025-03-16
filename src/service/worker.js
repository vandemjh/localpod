const { parentPort, workerData } = require('worker_threads');
const { process } = require('../service/process');

process(workerData.file, workerData.articleLink);
parentPort?.postMessage('Processing complete');
