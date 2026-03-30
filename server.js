const express = require('express');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const listingController = require('./src/controllers/listingController');
const authController = require('./src/controllers/authController');
const searchLimiter = require('./src/middleware/rateLimiter');


const auth = require('./src/middleware/authMiddleware');

const app = express();
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Stay API', version: '1.0.0', description: 'Listing & Booking API' },
        servers: [{ url: 'http://localhost:3000' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/controllers/*.js'],
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


app.get('/', (req, res) => {
    res.send("Sunucu Calisiyor!");
});


app.post('/api/v1/login', authController.login);


app.post('/api/v1/listings', auth, listingController.create);

app.post('/api/v1/listings/upload', auth, upload.single('file'), listingController.uploadCSV);


app.get('/api/v1/listings', searchLimiter, listingController.query);

app.post('/api/v1/bookings', auth, listingController.book);
app.post('/api/v1/reviews', auth, listingController.review);
app.get('/api/v1/admin/reports', auth, listingController.report);


// ------------------ SUNUCUYU AYAĞA KALDIR ------------------
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 SERVER HAZIR: http://localhost:${PORT}`);
    console.log(`📚 SWAGGER DOCS: http://localhost:${PORT}/api-docs`);
    console.log(`-----------------------------------------`);
});