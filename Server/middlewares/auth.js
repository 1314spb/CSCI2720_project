const express = require('express');
const router = express.Router();
module.exports = router;
const mongoose = require('mongoose');
const User = require('../models/User');


router.post('/register', async (req, res) => {
    console.log("Request recieved!");
    try{
        // res.status(200).json({msg: "Server post successfully"});
        const userEmailExist = await User.findOne({email : req.body.email});
        console.log(req.body);
        if(userEmailExist){
            res.status(400).json({error: "Email already exists"});
            return;
        }else{
            const newUser = ({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                admin: req.body.admin
            });
            // console.log(newUser.username);
            // await newUser.save();
            await User.create(newUser);
            // console.log(`User: ${newUser.email} has registered successfully!`);
            res.status(201).json({ message: 'Account created successfully', data: req.body });
        }

    }catch (error){
        console.log("Got error");
        res.status(400).json({message: error.message});
    }
})

router.post('/login', async(req, res) => {
    console.log("Login request recieved");
    try{
        const user = await mongoose.model('User').findOne({ email: req.body.email });
        if (!user) {
            // return res.status(401).json({ message: 'Invalid username' });
            return res.status(401).json({ message: 'Invalid email' });
        }

        if(user.password !== req.body.password) {
            return res.status(401).json({ message: 'Wrong password' });
        }

        res.status(200).json({
            message: "Login Successfully",
            userData: {
                userId: user.userId,
                username: user.username,
                email: user.email,
                admin: user.admin
            }
        });
    }catch(error){
        console.log("Got error during login");
        res.status(500).json({message: error.message});
    }
})