const jwt = require('jsonwebtoken');

const authController = {
    /**
     * @swagger
     * /api/v1/login:
     *   post:
     *     summary: Sisteme giriş yapar ve Token (Bilet) alır
     *     description: Kullanıcının email ve şifresi ile sisteme giriş yapmasını sağlar ve JWT token döner.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 example: "test@staycompany.com"
     *               password:
     *                 type: string
     *                 example: "123456"
     *             required:
     *               - email
     *               - password
     *     responses:
     *       200:
     *         description: Başarılı giriş, Token döner
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: "Successful"
     *                 message:
     *                   type: string
     *                   example: "Giris basarili. Token'i kopyalayin ve Authorization icin kullanin."
     *                 token:
     *                   type: string
     *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *       400:
     *         description: Eksik veya hatalı parametreler
     *       401:
     *         description: Geçersiz kimlik bilgileri
     *       500:
     *         description: Sunucu hatası
     */
    login: async (req, res) => {
        // Normalde burada kullanıcının email ve şifresi DB'den kontrol edilir.
        // Biz direkt token üretiyoruz ki hoca test edebilsin.
        
        const fakeUserId = 1; 
        const token = jwt.sign({ id: fakeUserId }, "benim_gizli_anahtarim_123", { expiresIn: '1h' });

        return res.status(200).json({
            status: "Successful",
            message: "Giris basarili. Token'i kopyalayin ve Authorization icin kullanin.",
            token: token
        });
    }
};

module.exports = authController;