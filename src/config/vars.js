const env = process.env;

module.exports = {
    env: env.NODE_ENV,
    port: env.PORT,

    UPLOAD_LIMIT: 5, // MB
    mongo: {
        uri: env.NODE_ENV === 'test' ? env.MONGO_URI_TESTS : env.MONGO_URI,
    },
    logs: env.NODE_ENV === 'production' ? 'combined' : 'dev',
    /** Authentication information */
    auth: {
        AccessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
        RefreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        CMSAccessTokenSecret: process.env.CMS_ACCESS_TOKEN_SECRET,
        CMSRefreshTokenSecret: process.env.CMS_REFRESH_TOKEN_SECRET,
        SaltRounds: Number(process.env.SALT_ROUNDS),
        AccessTokenExpire: Number(process.env.ACCESS_TOKEN_EXPIRE),
        AccessTokenWebExpire: Number(process.env.ACCESS_TOKEN_WEB_EXPIRE),
        RefreshTokenExpire: Number(process.env.REFRESH_TOKEN_EXPIRE),
    },
};
