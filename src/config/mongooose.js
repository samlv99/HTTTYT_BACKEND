const mongoose = require('mongoose');
const { mongo, env } = require('./vars');
const log = require('../app/helpers/log');

const logger = log('Mongoose');

// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err}`);
    process.exit(-1);
});

// Print mongoose logs in dev env
if (env === 'development') {
    mongoose.set('debug', true);
}

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */

export.connect = () => {
    mongoose.connect(mongo.uri, {
        keepAlive: 1,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    logger.info('Mongoose connect successfully!');
    return mongoose.connection;
};