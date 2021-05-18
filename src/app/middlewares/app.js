const { promisify } = require("bluebird");
const httpStatus = require("http-status");
const { verify } = require('jsonwebtoken');
const verifyAsync = promisify(verify);

const{ auth } = require('../../config/vars');
const { CommonStatus_INACTIVE } = require('../helpers/const');
const { Member } = require('../http/app/models');

function checkTokenApp(req, res, next) {
    let token = req.header['authorization'] || '';
    token = token.replace('Bearer ', '');
    if (!token) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Token is not exist.' });
    }
    verifyAsync(token, auth.AccessTokenSecret)
        .then(async (decoded) => {
            try {
                const member = await Member.findById(decoded._id);
                if (member.status === CommonStatus_INACTIVE || !member.status) {
                    return res.status(httpStatus.FORBIDDEN).json({ message: 'Member blocked.' });
                }
                req.memberId = decoded._id;
                next();
            } catch (error) {
                next(error);
            }
        })
        .catch(() => {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Token expired.' });
        });
}

function checkRefreshTokenApp(req, res, next) {
    const refreshToken = req.body.refreshToken || '';

    if (!refreshToken) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'RefreshToken is not exist.' });
    }
    verifyAsync(refreshToken, auth.RefreshTokenSecret)
        .then(async (decoded) => {
            try {
                const member = await Member.findById(decoded._id);
                if (refreshToken !== member.refreshToken)
                    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'RefreshToken is not exist.' });
                if (member.status === CommonStatus_INACTIVE || !member.status) {
                    return res.status(httpStatus.FORBIDDEN).json({ message: 'Member blocked.' });
                }
                req.memberId = decode._id;
                next();
            } catch (error) {
                next(error);
            }
        })
        .catch(() => {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'RefreshToken is not valid.' });
        });
}

module.exports = {
    checkTokenApp,
    checkRefreshTokenApp,
};