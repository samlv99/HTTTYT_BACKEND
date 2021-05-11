const mongoose = require('mongoose');

const { CommonStatus_Active } = require('../../../helpers/const');

/**
 * Product Schema
 * @private
 */

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            minLength: 6,
            maxLength: 255,
        },
        description: {
            type: String,
            minLength: 6,
            maxLength: 9999,
        },
        status: {
            type: Number,
            default: CommonStatus_Active,
        },
        price: {
            type: Number,
        },
        promotionPercent: {
            type: Number,
        },
        thumbnail: String,
    },
    {
        timestamps: true,
    }
);

/**
 * @typedef Product
 */

const Product = mongoose.model('Product', productSchema);
module.exports = Product;