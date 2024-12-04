const express = require('express');
const router = express.Router();
module.exports = router;
const mongoose = require('mongoose');
const User = require('../models/User');

// POST http://server-address/api/admin/createEvent
router.post('/createEvent', async (req, res) => {
    console.log("Request recieved!");
    
})