const express = require('express');
const cors = require('cors');
const bp = require('body-parser');
const log = require('morgan');
const winston = require('winston');
const path = require('path');

module.exports = (app) => {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    exitOnError: false,
    transports: [new winston.transports.Console()],
  });

  logger.stream = {
    write: function (message, encoding) {
      logger.info(message.replace(/\n$/, ''));
    },
  };

  app.use(cors());
  app.use(bp.json());
  app.use(bp.urlencoded({ extended: true }));
  app.use(
    log('combined', {
      stream: logger.stream,
    })
  );
  app.use('/api', require('../routes/api'));
  app.use(express.static(path.join(__dirname, '../public')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.status(404).json({
      message: req.method + ' ' + req.url + ' not found',
      error: 'NoEndpointExist',
      code: 404,
    });
    next();
  });
};
