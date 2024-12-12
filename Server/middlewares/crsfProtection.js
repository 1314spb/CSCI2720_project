const express = require('express');
const router = express.Router();
module.exports = router;

// Route to send CSRF token to the client
router.get('/csrf-token', (req, res) => {
    const token = req.csrfToken();
    console.log('Generated CSRF token:', token);
    res.json({ csrfToken: req.csrfToken() });
});


