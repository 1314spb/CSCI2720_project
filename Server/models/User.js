const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    AccId: {
        type: Number,
        require: true,
        unique: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        required: true,
    },
    admin: {
        type: Boolean,
        required: true,
    },
});

module.exports = mongoose.model('User', UserSchema);