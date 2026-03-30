const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Gelen isteğin başlığında (header) bilet var mı bak
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ status: "Error", message: "Erisim reddedildi. Token gerekli!" });
    }

    try {
        // 2. Bilet sahte mi diye kontrol et ("Bearer " kısmını atarak)
        const tokenWords = token.split(" ");
        const finalToken = tokenWords[1] ? tokenWords[1] : tokenWords[0];
        
        const verified = jwt.verify(finalToken, "benim_gizli_anahtarim_123"); // Gerçek projelerde bu .env içinde saklanır
        req.user = verified;
        
        // 3. Her şey yolundaysa içeri geçmesine izin ver
        next();
    } catch (error) {
        return res.status(400).json({ status: "Error", message: "Gecersiz token!" });
    }
};

module.exports = authMiddleware;