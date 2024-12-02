const mongoose = require('mongoose');

const LocationSchema = mongoose.Schema({
    locId: {
        type: Number,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    lat: {
        type: Number,
        required: true,
    },
    long: {
        type: Number,
        required: true,
    }
})

module.exports = mongoose.model('Location', LocationSchema);