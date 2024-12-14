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
    },
    price: {
        type: String,
    },
    duration: {
        type: String,
    },
    agelimit: {
        type: String,
    }
})

// EventSchema.pre('save', async function (next) {
//     if (!this.userId) {
//         try {
//             // Find the event with the highest eventId
//             const lastEvent = await mongoose.model('Event').findOne().sort({ eventId: -1 });
//             // Set the new eventId as the highest eventId + 1, or start with 1 if none exists
//             this.eventId = lastEvent ? lastEvent.eventId + 1 : 1;
//         } catch (error) {
//             return next(error);
//         }
//     }
//     next();
// });

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;