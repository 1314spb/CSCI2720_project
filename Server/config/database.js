const mongoose = require('mongoose');
const mongoURI = 'mongodb://127.0.0.1:27017/project';

mongoose.connect(mongoURI);

module.exports = mongoose.connection;