const express = require('express');
const router = express.Router();
module.exports = router;
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const authenticateUser = require('./authCheck');

// POST http://server-address/api/admin/createuser
router.post('/createuser', authenticateUser, async (req, res) => {
    const {username, email, password, admin} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`hashedPassword is ${hashedPassword}`)

    User.findOne({email: email})
    .then((data) => {
        if (data) {
            res.status(400).json({error: "Email already exists"});
        } else {
            const newUser = new User ({
                username,
                email,
                password: hashedPassword,
                admin
            });
            newUser.save()
            .then(() => {
                console.log('User create successfully');
                res.status(201).json({ message: 'Account created successfully', data: req.body });
            })
            .catch((err) => {
                console.log('Create user failed');
                res.status(400).json({message: err});
            })
        }
    })
    .catch((err) => {
        console.log('Error reading from User');
        res.status(500).json({error: 'Error reading from database'});
    })
})

// PUT http://server-address/api/admin/editPersonalInfo
router.put('/editPersonalInfo', authenticateUser, async (req, res) => {
    console.log('Edit personal info request received');
    try {
        const {userId} = req.user;
        const user = await User.findOne({userId});
        console.log("User found : ", user);
        const { username, password, admin } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await User.findByIdAndUpdate(
            user,
            { 
                username: username,
                password: hashedPassword,
                admin: admin
            },
            { new: true }
        )
        if(!updatedUser){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({
            message: 'User information updated successfully',
            userData: {
                userId: updatedUser._id,
                password: updatedUser.password,
                admin: admin
            },
        });
    } catch (error) {
        console.log("Error while updating user information : ", error);
        res.status(500).json({ message: error.message });
    }

})

// DELETE http://server-address/api/admin/deleteUser
router.delete('/deleteUser/:userId', authenticateUser, (req, res) => {
    const userId = req.params.userId;
    User.findOneAndDelete(
        { userId: userId }  
      )
      .then((data) => {
        if (data) {
          console.log('the deleted data is:', data);
          res.status(204).json({message: 'User deleted successfully'});
        } else res.status(404).json({message:"User ID not found"});
      })
      .catch((err) => {
        console.log("Failed to read from User");
        res.status(500).json({message:"Failed to read from User"});
      });
})

// POST http://server-address/api/admin/createevent
router.post('/createevent', authenticateUser, (req, res) => {
    const {title, datetime, presenter, description, venue, locId} = req.body;
 
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
            message: 'New Event created successfully'
        })
    })
    .catch((err) => {
        console.log('Failed to create new event');
        console.log(err);
        res.status(500).json({
            message: 'Failed to create new event'
        })
    })
})

// PUT http://server-address/api/admin/editevent/:eventId
router.put('/editevent/:eventId', authenticateUser, (req, res) => {
    const eventId = req.params.eventId;
    const {title, datetime, presenter, description, venue, locId} = req.body;

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
        res.status(500).json({
            message: 'failed'
        })
    })
})

// DELETE http://server-address/api/admin/deleteEvent
router.delete('/deleteEvent/:eventId', authenticateUser, (req, res) => {
    const eventId = req.params.eventId;
    Event.findOneAndDelete(
        { eventId: eventId }  
      )
      .then((data) => {
        if (data) {
          console.log('the deleted data is:', data);
          res.status(204).json({message: 'Event deleted successfully'});
        } else res.status(404).json({message:"Event ID not found"});
      })
      .catch((err) => {
        console.log("Failed to read from Event");
        res.status(500).json({message:"Failed to read from Event"});
      });
})