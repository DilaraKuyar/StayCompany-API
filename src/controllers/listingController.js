const listingService = require('../services/listingService');

const listingController = {
    // 1. Ev Ekleme (Host tarafı)
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
    }, // <-- BU VİRGÜL ÇOK KRİTİK!

    // 2. Arama (Guest tarafı) - ARTIK OBJENİN İÇİNDE
    uploadCSV: async (req, res) => {
        const fs = require('fs');
        const csv = require('csv-parser');
        const results = [];

        if (!req.file) {
            return res.status(400).json({ status: "Error", message: "Dosya yuklenmedi!" });
        }

        // Dosyayı oku ve parçala
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
     *     summary: İlanları arar
     *     description: Açıklama
     *     parameters:
     *       - in: query
     *         name: country
     *         schema:
     *           type: string      
     *         description: Ülke   
     *       - in: query
     *         name: city          
     *         schema:
     *           type: string
     *         description: Şehir  
     *     responses:
     *       200:
     *         description: Tamam
     */
    query: async (req, res) => {
        try {
            const results = await listingService.queryListings(req.query);
            return res.status(200).json({ status: "Successful", listings: results });
        } catch (error) {
            return res.status(500).json({ status: "Error", message: error.message });
        }
    }
    
};

module.exports = listingController;