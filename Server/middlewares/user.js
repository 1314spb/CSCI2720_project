const express = require('express');
const router = express.Router();
module.exports = router;
const mongoose = require('mongoose');
const User = require('../models/User');
const Location = require('../models/Location');
const Event = require('../models/Event');
const authenticateUser = require('./authCheck');
const bcrypt = require('bcrypt');

// GET http://server-address/api/user/getPersonalInfo
router.get('/getPersonalInfo', authenticateUser ,async (req, res) => {
    try {
        console.log("getPersonalInfo request received");
        // console.log("User ID need to find is ",req.user.userId);
        const {userId} = req.user;
        const user = await User.findOne({userId});
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        res.status(200).json({
          user: {
            userId: user.userId,
            username: user.username,
            password: user.password,
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

// PUT http://server-address/api/user/editPersonalInfo
router.put('/editPersonalInfo', authenticateUser, async (req, res) => {
    console.log('Edit personal info request received');
    try {
        const {userId} = req.user;
        const user = await User.findOne({userId});
        console.log("User found : ", user);
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await User.findByIdAndUpdate(
            user,
            password?
            { 
                username: username,
                password: hashedPassword
            }:{
                username: username
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
                password: updatedUser.password
            },
        });
    } catch (error) {
        console.log("Error while updating user information : ", error);
        res.status(500).json({ message: error.message });
    }

})

// GET http://server-address/api/user/location
router.get('/location',authenticateUser  ,(req, res) => {
    console.log("Locations fetching request got");
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
router.get('/event',authenticateUser, (req, res) => {
    console.log("Events fetching request got");
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

// GET http://server-address/api/user/userFavorites
router.get('/userFavorites', authenticateUser , async (req, res) => {
    console.log("Start getting userFavorites");
    try{
        const {userId} = req.user;
        const user = await User.findOne({userId});
        // console.log(user);
        const favLoc = await Location.find({locId: {$in: user.favLoc }});
        // console.log('favLoc is ', favLoc);
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

// PUT http://server-address/api/user/addFavLoc
router.put('/addFavLoc',authenticateUser, async (req, res) => {
    console.log("addFavLoc running");
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

// PUT http://server-address/api/user/removeFavLoc
router.put('/removeFavLoc', authenticateUser, async (req, res) => {
    console.log("removeFavLoc running");
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

// GET http://server-address/api/user/comment
router.get('/comment/:locId', authenticateUser, (req, res) => {
    const locId = req.params.locId;

    Location.findOne({locId: locId})
    .then((data) => {
        console.log('location comments found');
        res.send(data.comment);
    })
    .catch((err) => {
        console.log('Error reading from Location');
        res.status(500).json({message: 'Error reading from Location'})
    })
})

// POST http://server-address/api/user/comment
router.put('/addComment', authenticateUser, async (req, res) => {
    try {
        const {locId} = req.loc;
        const loc = await Location.findOne({locId});
        const { comment } = req.body; 
        console.log(comment);
        const updatedLocation = await Location.findByIdAndUpdate(
            loc,
            { $addToSet: { comment: [comment]} },
            { new: true }
        )
        if(!updatedLocation){
            return res.status(404).json({message: "User not found"});
        }
        console.log(`updatedLocation.comment is ${updatedLocation.comment}`);
        const Comments = await Location.find({ locId: {$in: updatedLocation.comment}});
        res.status(200).json({
            message: 'Location comments updated successfully',
            LocationData: {
                locId: updatedLocation.locId,
                comment: Comments,
            },
        });
    } catch (error) {
        console.log("Got error while updating comments");
        res.status(500).json({ message: error.message });
    }
})