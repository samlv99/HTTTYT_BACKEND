const { pick } = require('lodash');
const httpStatus = require('http-status');

const { apiJson } = require('../../../helpers/utils');
const { Member } = require('../../app/models');

const getProfile = async (req, res, next) => {
    const member = await Member.findById(req.memberId);
    const data = pick(member, ['_id', 'email', 'fullName', 'status', 'avatar']);
    res.status(httpStatus.OK);
    return apiJson({ req, res, data });
};

module.exports = {
    getProfile,
};