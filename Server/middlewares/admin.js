const express = require('express');
const router = express.Router();
module.exports = router;
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');

// POST http://server-address/api/admin/createuser
router.post('/createuser', (req, res) => {
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
    .catch((err) => {
        console.log('Failed to create new user');
        console.log(err);
        res.status(500).json({
            message: 'failed'
        })
    })
})

// PUT http://server-address/api/admin/modifyuser/:username
router.put('/modifyuser/:username', (req, res) => {
    const username = req.params.username;
    const newusername = req.body.newusername;
    const newpassword = req.body.password;
    const admin = req.body.admin;

    User.findOneAndUpdate(
        {username: username},
        {
            username: newusername,
            password: newpassword,
            admin: admin
        },
        {new: true}
    )
    .then((user) => {
        console.log('User information updated');
        console.log(user);
        res.status(201).json({
            message: 'success'
        })
    })
    .catch((err) => {
        console.log('User modification failed')
        console.log(err);
        res.status(400).json({
            message: 'failed'
        })
    })
})

// POST http://server-address/api/admin/createevent
router.post('/createevent', (req, res) => {
    const title = req.body.title;
    const datetime = req.body.datetime;
    const presenter = req.body.presenter;
    const description = req.body.description;
    const venue = req.body.venue;
    const locId = req.body.locId;

    const newEvent = new Event({
        title: title,
        datetime: datetime,
        presenter: presenter,
        description: description,
        venue: venue,
        locId: locId
    })

    newEvent.save()
    .then(() => {
        console.log('New Event created successfully');
        res.status(201).json({
            message: 'success'
        })
    })
    .catch((err) => {
        console.log('Failed to create new event');
        console.log(err);
        res.status(500).json({
            message: 'failed'
        })
    })
})

// PUT http://server-address/api/admin/modifyevent/:eventId
router.put('/modifyevent/:eventId', (req, res) => {
    const eventId = req.params.eventId;
    const title = req.body.title;
    const datetime = req.body.datetime;
    const presenter = req.body.presenter;
    const description = req.body.description;
    const venue = req.body.venue;
    const locId = req.body.locId;

    Event.findOneAndUpdate(
        {eventId: eventId},
        {
            title: title,
            datetime: datetime,
            presenter: presenter,
            description: description,
            venue: venue,
            locId: locId
        },
        {new: true}
    )
    .then((event) => {
        console.log('Event information updated');
        console.log(event);
        res.status(201).json({
            message: 'success'
        })
    })
    .catch((err) => {
        console.log('Event modification failed')
        console.log(err);
        res.status(400).json({
            message: 'failed'
        })
    })
})
