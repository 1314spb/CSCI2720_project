const express = require('express');
const router = express.Router();
module.exports = router;
const mongoose = require('mongoose');
const User = require('../models/User');

// POST http://server-address/api/admin/createEvent
router.post('/newevent', (req, res) => {
    console.log("Request recieved!");
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const admin = req.body.admin;

    const newUser = new User({
        username: username,
        email: email,
        password: password,
        admin: admin
    })

    newUser.save()
    .then(() => {
        console.log('New User created successfully');
        res.status(201).json({
            message: 'success'
        })
    })
    .catcH((err) => {
        console.log('Failed to create new user');
        res.status(500).json({
            message: 'failed'
        })
    })
})