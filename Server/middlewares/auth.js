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
            console.log(newUser.username);
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