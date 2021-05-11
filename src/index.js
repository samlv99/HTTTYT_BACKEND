const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const Promise = require('bluebird');
require('dotenv').config()

const { logs, UPLOAD_LIMIT } = require('./config/vars');
const mongoose = require('./config/mongoose');
const log = require('./app/helpers/log');

mongoose.connect(); // open mongoose connection

const app = express();
const port = process.env.PORT || 8080;
const logger = log('Index');

// request logging
app.use(morgan(logs));

// parse body params and attach them to req.body
app.use(express.json({ limit: `${UPLOAD_LIMIT}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${UPLOAD_LIMIT}mb` }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors()); 

// secure apps by setting various HTTP headers
app.use(helmet());




app.listen(port, () => {
    logger.info(`App is running on ${port}`);
});
