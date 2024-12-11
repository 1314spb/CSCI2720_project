const express = require('express');
const router = express.Router();
module.exports = router;
const mongoose = require('mongoose');
const User = require('../models/User');
const Location = require('../models/Location');
const Event = require('../models/Event');
const authenticateUser = require('./authCheck');

router.get('/getPersonalInfo', authenticateUser ,async (req, res) => {
    try {
        console.log("User ID need to find is ",req.user.userId);
        const {userId} = req.user;
        const user = await User.findOne({userId});
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        res.status(200).json({
          user: {
            userId: user.userId,
            username: user.username,
            email: user.email,
            admin: user.admin,
            favLoc: user.favLoc, // Assuming this is an array of location IDs
          },
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });

// GET http://server-address/api/user/location
router.get('/location',authenticateUser  ,(req, res) => {
    console.log("locations fetching request got");
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
// router.put('/addfavlocation/:userId/:locId', (req, res) => {
//     const userId = req.userId;
//     const locId = req.locId;

//     User.findOneAndUpdate(
//         {userId: userId},
//         {$addToSet: {favloc: locId}},
//         {new: true}
//     )
//     .then((user) => {
//         console.log('Favourite Location added successfully');
//         console.log(user);
//         res.status(201).json({
//             message: 'success'
//         })
//     })
//     .catch((err) => {
//         console.log('Failed to add location');
//         console.log(err);
//         res.status(400).json({
//             message: 'failed'
//         })
//     })
// }) .populate('favLoc', 'locId name numEvents')

router.get('/userFavorites', authenticateUser , async (req, res) => {
    console.log("Start getting userFavorites");
    try{
        const {userId} = req.user;
        const user = await User.findOne({userId});
        const favLoc = await Location.find({locId: {$in: user.favLoc }});
        console.log('favLoc is ', favLoc);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Favorite location sent successfully',
            favLoc: favLoc,
        })
    }catch(error){
        console.error('Error during fetching favorite locations', error);
        res.status(500).json({message: 'Error during fetching favorite locations'});
    }
 
})

router.put('/addFavLoc',authenticateUser, async (req, res) => {
    try {
        const {userId} = req.user;
        const user = await User.findOne({userId});
        const { favoriteLocationIds } = req.body; 
        console.log(favoriteLocationIds);
        const updatedUser = await User.findByIdAndUpdate(
            user,
            { $addToSet: { favLoc: [favoriteLocationIds]} },
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

router.put('/removeFavLoc', authenticateUser, async (req, res) => {
    try {
        const {userId} = req.user;
        const user = await User.findOne({userId});
        console.log("User found : ", user);
        const { favoriteLocationIds } = req.body; 
        console.log(favoriteLocationIds);
        const updatedUser = await User.findByIdAndUpdate(
            user,
            { $pull: { favLoc: {$in: [favoriteLocationIds]} } },
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
        console.log("Got error while removing favorite location : ", error);
        res.status(500).json({ message: error.message });
    }
});