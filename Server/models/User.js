const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: {
        type: Number,
        unique: true
    },
    username: {
        type: String,
        maxlength: 20,
        unique: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    admin: {
        type: Boolean,
        default: false
    },
    favLoc: [{
        type: Number,
        ref: 'Location',
        default: []
    }]
});

UserSchema.pre('save', async function (next) {
    if (!this.userId) {
        try {
            // Find the user with the highest userId
            const lastUser = await mongoose.model('User').findOne().sort({ userId: -1 });
            // Set the new userId as the highest userId + 1, or start with 1 if none exists
            this.userId = lastUser ? lastUser.userId + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;