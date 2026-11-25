const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    pname: {
        type: String,
        required: true
    },

    pdesc: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    powner: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Products', ProductSchema)