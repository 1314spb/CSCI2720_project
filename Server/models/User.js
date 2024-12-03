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
        require: true,
    },
    admin: {
        type: Boolean,
        require: true
    },
});

module.exports = mongoose.model('User', UserSchema);