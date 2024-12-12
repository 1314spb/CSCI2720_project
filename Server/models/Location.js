const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
    username: {
        type: Number,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

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
    },
    comment: [CommentSchema]
})

module.exports = mongoose.model('Location', LocationSchema);