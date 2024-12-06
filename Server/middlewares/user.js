const express = require('express');
const router = express.Router();
module.exports = router;
const mongoose = require('mongoose');
const User = require('../models/User');
const Location = require('../models/Location');
const Event = require('../models/Event');

// GET http://server-address/api/user/location
router.get('/location', (req, res) => {
    Location.find({})
    .then((locations) => {
        res.send(locations);
    })
    .catch((err) => {
        console.log('Failed to read from Location');
        console.log(err);
        res.status(404).json({
            message: 'failed'
        })
    })
})

// GET http://server-address/api/user/event
router.get('/event', (req, res) => {
    Event.find({})
    .then((events) => {
        res.send(events);
    })
    .catch((err) => {
        console.log('Failed to read from Event');
        console.log(err);
        res.status(404).json({
            message: 'failed'
        })
    })
})

// PUT http://server-address/api/user/addfavlocation
router.put('/addfavlocation/:userId/:locId', (req, res) => {
    const userId = req.userId;
    const locId = req.locId;

    User.findOneAndUpdate(
        {userId: userId},
        {$addToSet: {favloc: locId}},
        {new: true}
    )
    .then((user) => {
        console.log('Favourite Location added successfully');
        console.log(user);
        res.status(201).json({
            message: 'success'
        })
    })
    .catch((err) => {
        console.log('Failed to add location');
        console.log(err);
        res.status(400).json({
            message: 'failed'
        })
    })
})