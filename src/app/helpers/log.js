const { configure, getLogger } = require('log4js');

configure({
  appenders: {
    console: {
      type: 'console',
    },
    errorFile: {
      type: 'dateFile',
      filename: 'logs/error.log',
      keepFileExt: true,
    },
    errors: {
      type: 'logLevelFilter',
      level: 'ERROR',
      appender: 'errorFile',
    },
  },
  categories: {
    default: { appenders: ['console', 'errors'], level: 'debug' },
  },
});

const log = (service) => {
  const logger = getLogger(service);
  return logger;
};

module.exports = log;
