const listingService = require('../services/listingService');

const listingController = {
    /**
     * @swagger
     * /api/v1/listings:
     *   post:
     *     summary: Yeni bir ev/ilan ekler (Host tarafı)
     *     description: Ev sahibinin sisteme yeni bir kiralık ev eklemesini sağlar.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               host_id:
     *                 type: integer
     *                 example: 1
     *               no_of_people:
     *                 type: integer
     *                 example: 4
     *               country:
     *                 type: string
     *                 example: "Turkey"
     *               city:
     *                 type: string
     *                 example: "Izmir"
     *               price:
     *                 type: number
     *                 example: 1500.50
     *     responses:
     *       201:
     *         description: İlan başarıyla oluşturuldu
     *       400:
     *         description: Eksik parametreler
     */
    create: async (req, res) => {
        try {
            const { host_id, no_of_people, country, city, price } = req.body;

            if (!host_id || !no_of_people || !country || !city || !price) {
                return res.status(400).json({ 
                    status: "Error", 
                    message: "Eksik parametreler!" 
                });
            }

            const result = await listingService.createListing(req.body);
            return res.status(201).json({ status: "Successful", id: result.insertId });
        } catch (error) {
            return res.status(500).json({ status: "Error", message: error.message });
        }
    },

    /**
     * @swagger
     * /api/v1/listings/upload:
     *   post:
     *     summary: CSV dosyası ile toplu ilan yükler
     *     description: İçinde birden fazla ilan verisi olan bir CSV dosyasını okuyup veritabanına tek seferde ekler.
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: Yüklenecek CSV dosyası (.csv)
     *     responses:
     *       201:
     *         description: İlanlar başarıyla yüklendi
     *       400:
     *         description: Dosya yüklenmedi hatası
     */
    uploadCSV: async (req, res) => {
        const fs = require('fs');
        const csv = require('csv-parser');
        const results = [];

        if (!req.file) {
            return res.status(400).json({ status: "Error", message: "Dosya yuklenmedi!" });
        }

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    await listingService.createManyListings(results);
                    res.status(201).json({ status: "Successful", message: `${results.length} ilan yuklendi.` });
                } catch (err) {
                    res.status(500).json({ status: "Error", message: err.message });
                }
            });
    },

    /**
     * @swagger
     * /api/v1/listings/book:
     *   post:
     *     summary: Bir ev için rezervasyon yapar (Guest tarafı)
     *     description: Misafirin bir evi kiralamasını/rezervasyon yapmasını sağlar.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               listing_id:
     *                 type: integer
     *                 example: 101
     *               guest_id:
     *                 type: integer
     *                 example: 5
     *     responses:
     *       201:
     *         description: Rezervasyon başarılı
     *       400:
     *         description: Rezervasyon hatası
     */
    book: async (req, res) => {
        try {
            const result = await listingService.bookAStay(req.body);
            res.status(201).json({ status: "Successful", booking_id: result.insertId });
        } catch (error) {
            res.status(400).json({ status: "Error", message: error.message });
        }
    },

    /**
     * @swagger
     * /api/v1/listings:
     *   get:
     *     summary: İlanları arar ve listeler (Sayfalama destekli)
     *     description: Ülke ve şehir bilgisine göre ilanları getirir. Sonuçları sayfalara bölerek sunucuyu yormaz.
     *     parameters:
     *       - in: query
     *         name: country
     *         schema:
     *           type: string
     *         description: Ülke adı (Örn. Turkey)
     *       - in: query
     *         name: city
     *         schema:
     *           type: string
     *         description: Şehir adı (Örn. Izmir)
     *       - in: query
     *         name: no_of_people
     *         schema:
     *           type: integer
     *         description: Minimum kişi sayısı
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Kaçıncı sayfa? (Örn. 1)
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Sayfa başına kaç kayıt gelsin? (Örn. 10)
     *     responses:
     *       200:
     *         description: Başarılı şekilde listelendi
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: "Successful"
     *                 current_page:
     *                   type: integer
     *                   example: 1
     *                 items_per_page:
     *                   type: integer
     *                   example: 10
     *                 total_results_on_page:
     *                   type: integer
     *                   example: 5
     *                 listings:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: integer
     *                         example: 1
     *                       host_id:
     *                         type: integer
     *                         example: 1
     *                       no_of_people:
     *                         type: integer
     *                         example: 4
     *                       country:
     *                         type: string
     *                         example: "Turkey"
     *                       city:
     *                         type: string
     *                         example: "Izmir"
     *                       price:
     *                         type: number
     *                         example: 1500.50
     *       400:
     *         description: Geçersiz parametreler
     *       500:
     *         description: Sunucu hatası
     */
    query: async (req, res) => {
        try {
            // URL'den gelen sayfa ve limit değerlerini alıyoruz
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            // Verileri servisten çekiyoruz
            const results = await listingService.queryListings(req.query);
            
            // Cevabı sayfalama bilgileriyle beraber döndürüyoruz
            return res.status(200).json({ 
                status: "Successful", 
                current_page: page,
                items_per_page: limit,
                total_results_on_page: results.length,
                listings: results 
            });
        } catch (error) {
            return res.status(500).json({ status: "Error", message: error.message });
        }
    }
    
};

module.exports = listingController;