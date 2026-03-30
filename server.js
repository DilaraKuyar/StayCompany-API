const express = require('express');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// 1. Controller ve Middleware Çağrıları
const listingController = require('./src/controllers/listingController');
const authController = require('./src/controllers/authController');
const searchLimiter = require('./src/middleware/rateLimiter');

// İŞTE YENİ GÜVENLİK GÖREVLİMİZ BURADA! 👇
const auth = require('./src/middleware/authMiddleware');

// 2. Uygulamayı (App) Başlatma
const app = express();
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// 3. Swagger (Dokümantasyon) Ayarları
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Stay API', version: '1.0.0', description: 'Listing & Booking API' },
        servers: [{ url: 'http://localhost:3000' }],
    },
    apis: ['./src/controllers/*.js'],
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


// ------------------ ROTALAR (ROUTES) ------------------

app.get('/', (req, res) => {
    res.send("Sunucu Calisiyor!");
});

// GÜVENLİK: Login (Bilet alma yeri, buraya kilit konmaz)
app.post('/api/v1/login', authController.login);

// HOST: Ev Ekleme (Manuel) -> KİLİT EKLENDİ (auth)
app.post('/api/v1/listings', auth, listingController.create);

// HOST: Ev Ekleme (CSV ile) -> KİLİT EKLENDİ (auth)
app.post('/api/v1/listings/upload', auth, upload.single('file'), listingController.uploadCSV);

// GUEST: Ev Arama (Sayfalama + Rate Limiter) -> KİLİT YOK (Tabloya göre NO)
app.get('/api/v1/listings', searchLimiter, listingController.query);

// GUEST: Rezervasyon Yapma -> KİLİT EKLENDİ (auth)
app.post('/api/v1/bookings', auth, listingController.book);


// ------------------ SUNUCUYU AYAĞA KALDIR ------------------
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 SERVER HAZIR: http://localhost:${PORT}`);
    console.log(`📚 SWAGGER DOCS: http://localhost:${PORT}/api-docs`);
    console.log(`-----------------------------------------`);
});