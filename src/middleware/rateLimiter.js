const rateLimitMap = new Map(); // Kim ne kadar arama yaptı burada tutacağız

const searchLimiter = (req, res, next) => {
    const ip = req.ip; // Arama yapanın IP adresi
    const today = new Date().toDateString(); // Bugünün tarihi (Örn: "Sun Mar 29 2026")
    const key = `${ip}_${today}`; // IP + Tarih birleşimi (Örn: "127.0.0.1_Sun Mar 29 2026")

    const currentUsage = rateLimitMap.get(key) || 0;

    if (currentUsage >= 3) {
        return res.status(429).json({ 
            status: "Error", 
            message: "Günlük arama limitiniz (3) dolmuştur. Yarın tekrar deneyin." 
        });
    }

    // Limiti bir artır ve devam etmesine izin ver
    rateLimitMap.set(key, currentUsage + 1);
    console.log(`IP: ${ip} | Bugün yapılan arama sayısı: ${currentUsage + 1}`);
    next();
};

module.exports = searchLimiter;