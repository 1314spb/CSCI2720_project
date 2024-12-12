require('dotenv').config();
const express = require('express');
const router = express.Router();
module.exports = router;
const mongoose = require('mongoose');
const User = require('../models/User');
const Location = require('../models/Location');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authenticateUser = require('./authCheck');

router.post('/register', async (req, res) => {
    console.log("Request recieved!");
    try{
        console.log("Register request got");
        console.log('Token received from client:', req.headers['csrf-token']);
        const {username, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`hashedPassword is ${hashedPassword}`)
        const userEmailExist = await User.findOne({email : email});
        console.log(req.body);
        if(userEmailExist){
            res.status(400).json({error: "Email already exists"});
            return;
        }else{
            const newUser = new User ({
                username,
                email,
                password: hashedPassword,
                // admin,
                favLoc: []
            });
            // console.log(newUser.username);
            await newUser.save();
            // await User.create(newUser);
            // console.log(`User: ${newUser.email} has registered successfully!`);
            res.status(201).json({ message: 'Account created successfully', data: req.body });
        }

    }catch (error){
        console.log("Got error");
        console.log(error.message);
        res.status(400).json({message: error.message});
    }
})

router.post('/login', async (req, res) => {
    console.log("Login request recieved");
    try{
        const {username , password, rememberMe} = req.body;
        // const user = await mongoose.model('User').findOne({ email: req.body.email });
        const user = await mongoose.model('User').findOne({ username: username });
        if (!user) {
            console.log("Invalid username");
            return res.status(401).json({ message: 'Invalid username' });
            // return res.status(401).json({ message: 'Invalid email' });
        }
        const checkPassword = await bcrypt.compare(password, user.password);
        if(!checkPassword) {
            console.log("Wrong password");
            return res.status(401).json({ message: 'Wrong password' });
        }
        const tokenExpiry = rememberMe ? '7d' : '1d' ;
        console.log("tokenExpiry is : ", tokenExpiry);
        // console.log("process.env.JWT_SECRET_KEY is ", process.env.JWT_SECRET_KEY);
        const token = jwt.sign({ userId: user.userId, username: user.username}, 
            "mySecretKey",
            {expiresIn: tokenExpiry}
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: rememberMe? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, //7d : 1d
        });

        // const favLocInfo = await Location.find({ locId: { $in: user.favLoc } });
        // console.log(favLocInfo);
        res.status(200).json({
            message: "Login Successfully",
            userData: {
                userId: user.userId,
                username: user.username,
                email: user.email,
                admin: user.admin,
                favLoc: user.favLoc
            },
            token
        });
    }catch(error){
        console.log("Got error during login");
        res.status(500).json({message: error.message});
    }
})

router.post('/logout', async (req, res) => {
    console.log("logout request recieved");
    try{
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });
        res.status(200).json({message: 'Logged out successfully'});
    }catch(error){
        console.log(error.message);
        res.status(500).json({message: error.message});
    }
})

router.get('/checkAuth', (req, res) => {
    console.log("checkAuth is running");
    const token = req.cookies.authToken;
    console.log("token got");
    // console.log("token is : ", token);

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, "mySecretKey"); 
      console.log("decoded is : ", decoded);  
      res.status(200).json({ message: 'Authenticated', user: decoded });
    } catch (error) {
        if(error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired'});
        }
      res.status(403).json({ message: 'Invalid or expired token' });
    }
  });