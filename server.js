const express = require('express');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// 1. Controller ve Middleware Çağrıları
const listingController = require('./src/controllers/listingController');
const authController = require('./src/controllers/authController'); // Eksik olan çağrı eklendi!
const searchLimiter = require('./src/middleware/rateLimiter');

// 2. Uygulamayı (App) Başlatma
const app = express();
app.use(express.json()); // JSON verilerini okuyabilmek için şart!

// Multer Ayarı
const upload = multer({ dest: 'uploads/' });

// 3. Swagger (Dokümantasyon) Ayarları
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Stay API', version: '1.0.0', description: 'Listing & Booking API' },
        servers: [{ url: 'http://localhost:3000' }],
    },
    apis: ['./src/controllers/*.js'], // Controller içindeki notları okuyacak
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


// ------------------ ROTALAR (ROUTES) ------------------

// TEST ROTASI: http://localhost:3000/
app.get('/', (req, res) => {
    res.send("Sunucu Calisiyor!");
});

// GÜVENLİK: Login
app.post('/api/v1/login', authController.login);

// HOST: Ev Ekleme (Manuel)
app.post('/api/v1/listings', listingController.create);

// HOST: Ev Ekleme (CSV ile)
app.post('/api/v1/listings/upload', upload.single('file'), listingController.uploadCSV);

// GUEST: Ev Arama (Sayfalama + Rate Limiter)
app.get('/api/v1/listings', searchLimiter, listingController.query);

// GUEST: Rezervasyon Yapma
app.post('/api/v1/bookings', listingController.book);


// ------------------ SUNUCUYU AYAĞA KALDIR ------------------
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 SERVER HAZIR: http://localhost:${PORT}`);
    console.log(`📚 SWAGGER DOCS: http://localhost:${PORT}/api-docs`);
    console.log(`-----------------------------------------`);
});