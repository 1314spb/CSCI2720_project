const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    console.log('Cookie: ', req.cookies);
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const verified = jwt.verify(token, "mySecretKey");
      req.user = verified; 
      next();
    } catch (error) {
      res.status(403).json({ message: 'Invalid or expired token' });
    }
  };

  module.exports = authenticateUser;