/**
 * Simple logging utility for tracking app events
 */

const logLevels = {
  INFO: 'INFO',
  ERROR: 'ERROR',
  WARN: 'WARN',
  DEBUG: 'DEBUG'
};

const getTimestamp = () =>  new Date().toISOString();

const log = (level, message, data = {}) => {
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...data
  };

  switch (level) {
    case logLevels.ERROR:
      console.error(JSON.stringify(logEntry, null, 2));
      break;
    case logLevels.WARN:
      console.warn(JSON.stringify(logEntry, null, 2));
      break;
    case logLevels.DEBUG:
      if (process.env.DEBUG_MODE === 'true') {
        console.log(JSON.stringify(logEntry, null, 2));
      }
      break;
    default:
      console.log(JSON.stringify(logEntry, null, 2));
  }
};

const logger = {
  info: (message, data) => log(logLevels.INFO, message, data),
  error: (message, data) => log(logLevels.ERROR, message, data),
  warn: (message, data) => log(logLevels.WARN, message, data),
  debug: (message, data) => log(logLevels.DEBUG, message, data)
};

module.exports = logger;
