const express = require('express');
const router = express.Router();
const authenticateUser = require('./authCheck');
// Protected route
 router.get('/', authenticateUser, (req, res) => {
    res.status(200).json({ message: 'Protected route accessed' });
 });

module.exports = router;