const express = require('express');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');

const { CommonStatus_ACTIVE } = require('../../../helpers/const');

/**
 * Member Schema
 * @private
 */

const memberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            match: /^\S+@\S+\.\S+$/,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: { unique: true },
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 128,
        },
        fullName: {
            type: String,
            maxlength: 128,
            index: true,
            trim: true,
        },
        service: {
            facebook: String,
            google: String,
        },
        avatar: {
            type: String,
            trim: true,
            // default: 'https://res.cloudinary.com/phamtienduc/image/upload/v1619884133/uploads/default-avatar_iliixs.png',
        },
        refreshToken: {
            type: String,
        },
        status: {
            type: Number,
            default: CommonStatus_ACTIVE,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * @typedef Member
 */
const Member = mongoose.model('Member', memberSchema);
module.exports = Member;