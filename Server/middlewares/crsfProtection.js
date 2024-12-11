const express = require('express');
const router = express.Router();
module.exports = router;

// Route to send CSRF token to the client
router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Example protected POST route
router.post('/protected', (req, res) => {
    res.json({ message: 'CSRF-protected POST request successful!' });
});

// Example protected DELETE route
router.delete('/delete-item', (req, res) => {
    res.json({ message: 'CSRF-protected DELETE request successful!' });
});

