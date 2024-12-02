const mongoose = require('mongoose');

const EventSchema = mongoose.Schema({
    eventId: {
        type: Number,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    datetime: {
        type: String,
        required: true,
    },
    presenter: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    venue: {
        type: String,
        required: true,
    },
    locId: {
        type: Number,
        required: true,
    }
})

module.exports = mongoose.model('Event', EventSchema);