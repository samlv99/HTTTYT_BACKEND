const env = process.env;

module.exports = {
    env: env.NODE_ENV,
    port: env.PORT,

    UPLOAD_LIMIT: 5, // MB
    mongo: {
        uri: env.NODE_ENV === 'test' ? env.MONGO_URI_TESTS : env.MONGO_URI,
    },
    logs: env.NODE_ENV === 'production' ? 'combined' : 'dev',
};