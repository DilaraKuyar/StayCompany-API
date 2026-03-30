const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ status: "Error", message: "Access denied. Token required!" });
    }

    try {
        
        const tokenWords = token.split(" ");
        const finalToken = tokenWords[1] ? tokenWords[1] : tokenWords[0];
        
        const verified = jwt.verify(finalToken, "mysecret_key_1234"); 
        req.user = verified;
        
        
        next();
    } catch (error) {
        return res.status(400).json({ status: "Error", message: "Invalid Token!" });
    }
};

module.exports = authMiddleware;