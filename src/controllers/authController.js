const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authController = {
    login: async (req, res) => {
        const { email, password } = req.body;
        // Basitlik için veritabanında kullanıcıyı buluyoruz (Şifre kontrolü sembolik)
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length > 0) {
            const token = jwt.sign({ id: users[0].id, role: users[0].role }, 'gizli_anahtar', { expiresIn: '1h' });
            return res.json({ status: "Successful", token });
        }
        res.status(401).json({ status: "Error", message: "Hatalı giriş!" });
    }
};
module.exports = authController;