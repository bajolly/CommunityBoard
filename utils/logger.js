const winston = require('winston');
const path = require('path');

const logDir = 'logs';
const isProduction = process.env.NODE_ENV === 'production';
const isDebug = process.env.NODE_ENV === 'debug' || process.env.DEBUG === 'true';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ' ' + JSON.stringify(metadata);
    }
    return msg;
  })
);

const transports = [
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: logFormat
  })
];

if (!isProduction || isDebug) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: isDebug ? 'debug' : 'info'
    })
  );
}

const logger = winston.createLogger({
  level: isDebug ? 'debug' : (isProduction ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: { service: 'community-board' },
  transports
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message.trim());
  }
};

module.exports = logger;