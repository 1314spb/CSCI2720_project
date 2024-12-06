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

router.put('/addFavLoc/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { favoriteLocationIds } = req.body; 
        console.log(favoriteLocationIds);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favLoc: favoriteLocationIds} },
            { new: true }
        )
        if(!updatedUser){
            return res.status(404).json({message: "User not found"});
        }
        console.log(`updatedUser.favLoc is ${updatedUser.favLoc}`);
        const favoriteLocations = await Location.find({ locId: {$in: updatedUser.favLoc}});
        res.status(200).json({
            message: 'Favorite locations updated successfully',
            userData: {
                userId: updatedUser._id,
                email: updatedUser.email,
                admin: updatedUser.admin,
                favLoc: favoriteLocations,
            },
        });
    } catch (error) {
        console.log("Got error while updating favorites");
        res.status(500).json({ message: error.message });
    }
});

router.put('/removeFavLoc/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { favoriteLocationIds } = req.body; 
        // console.log(favoriteLocationIds);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { favLoc: {$in: favoriteLocationIds} } },
            { new: true }
        )
        if(!updatedUser){
            return res.status(404).json({message: "User not found"});
        }
        console.log(`updated favLoc is ${updatedUser.favLoc}`);
        const favoriteLocations = await Location.find({ locId: {$in: updatedUser.favLoc}});
        res.status(200).json({
            message: 'Favorite locations removed successfully',
            userData: {
                userId: updatedUser._id,
                email: updatedUser.email,
                admin: updatedUser.admin,
                favLoc: favoriteLocations,
            },
        });
    } catch (error) {
        console.log("Got error while removing favorite location");
        res.status(500).json({ message: error.message });
    }
});