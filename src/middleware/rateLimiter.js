const rateLimitMap = new Map(); 

const searchLimiter = (req, res, next) => {
    const ip = req.ip; 
    const today = new Date().toDateString(); 
    const key = `${ip}_${today}`; 

    const currentUsage = rateLimitMap.get(key) || 0;

    if (currentUsage >= 3) {
        return res.status(429).json({ 
            status: "Error", 
            message: "Daily search limit reached. You can only search 3 per day." 
        });
    }

    rateLimitMap.set(key, currentUsage + 1);
    console.log(`IP: ${ip} | Daily search count: ${currentUsage + 1}`);
    next();
};

module.exports = searchLimiter;