const httpStatus = require('http-status');
const { hashSync, compareSync } = require('bcryptjs');
const { pick } = require('lodash');
const { to } = require('await-to-js');
const { sign, verify } = require('jsonwebtoken');
const{ promisify } = require('util');
const verifyAsync = promisify(verify);


const { Member } = require('../models');
const { auth } = require('../../../../config/vars');

const { CommonStatus_ACTIVE, CommonStatus_INACTIVE } = require('../../../helpers/const');

const generateAccessToken = (dataEncode) => {
    return sign(dataEncode, auth.AccessTokenSecret, {
        algorithm: 'HS256',
        expiresIn: auth.AccessTokenExpire,
    });
};

const generateRefreshToken = (dataEncode) => {
    return sign(dataEncode, auth.RefreshTokenSecret, {
        algorithm: 'HS256',
        expiresIn: auth.RefreshTokenExpire,
    });
};

const generateToken = async (id) => {
    const member = await Member.findById(id);
    const dataEncode = pick(member, ['_id', 'status']);
    const token = generateAccessToken(dataEncode);
    const oldRefreshToken = member.refreshToken;

    const [error] = await to(verifyAsync(oldRefreshToken, auth.RefreshTokenSecret));
    
    if (error) {
        const dataEncodeRefreshToken = pick(member, ['_id', 'status']);
        const newRefreshToken = generateRefreshToken(dataEncodeRefreshToken);

        await Member.updateOne(
            { _id: member._id },
            {
                refreshToken: newRefreshToken,
            } 
        );

        return { token, refreshToken: newRefreshToken };
    }
    return { token, refreshToken: oldRefreshToken };
};

/**
 * Returns jwt token if registration was successful
 * @public
 */
const register = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        const member = await Member.findOne({ email });
        if (member) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Member already exists!'});
        }
        const hashPassword = hashSync(password, auth.SaltRounds);
        const newMember = await new Member({
            email,
            password: hashPassword,
        }).save();

        const token = await generateToken(newMember._id);
        res.status(httpStatus.CREATED);
        const data = { member: newMember, token };
        return res.json({ data });
    } catch (error) {
        next(error);
    }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const member = await Member.findOne({ email });
        if (!member) return res.status(httpStatus.BAD_REQUEST).json({ message: `Member doesn't exist.` });

        if (member.status === CommonStatus_INACTIVE)
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Member blocked. '});

        const isTruePassword = compareSync(password, member.password);
        if (!isTruePassword) return res.status(httpStatus.BAD_REQUEST).json({ message: 'Email or password is invalid.'});

        const token = await generateToken(member._id);
        const data = { member, token };
        return res.json({ data });
    } catch (error) {
        return next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const member = await Member.findById(req.memberId);
        if (!member) return res.status(httpStatus.BAD_REQUEST).json({ message: 'Member does not exist.' });

        const isTruePassword = compareSync(oldPassword, member.password);
        if (!isTruePassword) return res.status(httpStatus.BAD_REQUEST).json({ message: 'Email or password is invalid.' });

        if (oldPassword === newPassword)
            return res
                .status(httpStatus.UNPROCESSABLE_ENTITY)
                .json({ message: 'The new password cannot be same old password' });
        const passwordHash = hashSync(newPassword, auth.SaltRounds);
        await Member.updateOne({ _id: req.memberId }, { password: passwordHash});

        res.status(httpStatus.OK).json({ success: true });
    } catch (error) {
        return next(error);
    }
};

const requestAccessToken = async (req, res, next) => {
    try {
        const member = await Member.findById(req.memberId);
        const dataEncode = pick(member, ['_id', 'status']);
        const token = generateAccessToken(dataEncode);
        const data = { _id: member.id, token };

        res.status(httpStatus.OK);
        return res.json({ data });
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    register,
    login,
    changePassword,
    requestAccessToken,
};