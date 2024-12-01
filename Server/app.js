const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
// Serve static files from the React app in the 'dist' directory
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

const PORT = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/project');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));

db.once('open', () => {
    console.log('Connection is open...');

    // User Schema - the account can either be admin or user
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
        }
    });

    // Location Schema
    const LocationSchema = mongoose.Schema({
        LocId: {
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

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    })

})

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});