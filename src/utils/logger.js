const config = require('../config');

const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
const CURRENT_LEVEL = config.logLevel.toUpperCase();

function log(level, ...args) {
  if (LOG_LEVELS[level] <= (LOG_LEVELS[CURRENT_LEVEL] ?? LOG_LEVELS.INFO)) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}]`, ...args);
  }
}

module.exports = {
  error: (...args) => log('ERROR', ...args),
  warn: (...args) => log('WARN', ...args),
  info: (...args) => log('INFO', ...args),
  debug: (...args) => log('DEBUG', ...args)
};
