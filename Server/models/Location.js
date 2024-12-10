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
    },
    numEvents: {
        type: Number,
        default: 0,
    }
})

module.exports = mongoose.model('Location', LocationSchema);