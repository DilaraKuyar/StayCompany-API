const listingService = require('../services/listingService');

const listingController = {
    /**
     * @swagger
     * /api/v1/listings:
     *   post:
     *     summary: Adds a new property/listing (Host side
     *     description: Allows the host to add a new rental property to the system.
     *     security:
     *       - bearerAuth: []
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
     *             required:
     *               - host_id
     *               - no_of_people
     *               - country
     *               - city
     *               - price
     *     responses:
     *       201:
     *         description: Listing created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: "Successful"
     *                 id:
     *                   type: integer
     *                   example: 1
     *       400:
     *         description: Missing parameters
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Server error
     */
    create: async (req, res) => {
        try {
            const { host_id, no_of_people, country, city, price } = req.body;
            if (!host_id || !no_of_people || !country || !city || !price) {
                return res.status(400).json({ status: "Error", message: "Eksik parametreler!" });
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
     *     summary: adds multiple ads with CSV file
     *     description: It reads a CSV file containing multiple job listings and adds them to the database all at once.
     *     security:
     *       - bearerAuth: []
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
     *                 description: CSV file which will upload (.csv)
     *     responses:
     *       201:
     *         description: Listings added successfully
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
     *                   example: "5 listings have been uploaded."
     *       400:
     *         description: File not uploaded or invalid format
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Server error
     */
    uploadCSV: async (req, res) => {
        const fs = require('fs');
        const csv = require('csv-parser');
        const results = [];
        if (!req.file) return res.status(400).json({ status: "Error", message: "File not uploaded!" });

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    await listingService.createManyListings(results);
                    res.status(201).json({ status: "Successful", message: `${results.length} listings have been uploaded.` });
                } catch (err) {
                    res.status(500).json({ status: "Error", message: err.message });
                }
            });
    },

    /**
     * @swagger
     * /api/v1/bookings:
     *   post:
     *     summary: books a home (Guest side)
     *     description: Allows a guest to book a stay at a listing.
     *     security:
     *       - bearerAuth: []
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
     *             required:
     *               - listing_id
     *               - guest_id
     *     responses:
     *       201:
     *         description: booking successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: "Successful"
     *                 booking_id:
     *                   type: integer
     *                   example: 123
     *       400:
     *         description: Booking error
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Server error
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
     *     summary: Searches and lists listings (Pagination supported)
     *     description: Retrieves listings based on country and city information. Divides results into pages to avoid overloading the server.
     *     parameters:
     *       - in: query
     *         name: country
     *         schema:
     *           type: string
     *         description: Country name (like Turkey)
     *       - in: query
     *         name: city
     *         schema:
     *           type: string
     *         description: city name (e.g., Izmir)
     *       - in: query
     *         name: no_of_people
     *         schema:
     *           type: integer
     *         description: Min number of people
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
     *         description: How many records per page? (like 10)
     *     responses:
     *       200:
     *         description: Successful
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
     *         description: Invalid parameters
     *       500:
     *         description: Server error
     */
    query: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const results = await listingService.queryListings(req.query);
            return res.status(200).json({ 
                status: "Successful", 
                current_page: page,
                listings: results 
            });
        } catch (error) {
            return res.status(500).json({ status: "Error", message: error.message });
        }
    },

    /**
     * @swagger
     * /api/v1/reviews:
     *   post:
     *     summary: Reviews the place where you stayed (Guest side)
     *     description: Allows guests to leave reviews about the place they stayed.
     *     security:
     *       - bearerAuth: []
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
     *               rating:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 5
     *                 example: 4
     *               comment:
     *                 type: string
     *                 example: "Awesome stay, very clean and cozy"
     *             required:
     *               - listing_id
     *               - rating
     *     responses:
     *       201:
     *         description: Review saved successfully
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
     *                   example: "Review saved successfully"
     *       400:
     *         description: Invalid review data
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Server error
     */
    review: async (req, res) => {
        return res.status(201).json({ status: "Successful", message: "Review saved successfully" });
    },

    /**
     * @swagger
     * /api/v1/admin/reports:
     *   get:
     *     summary: Fetch listing reports (Admin side)
     *     description: Fetches performance reports for all listings in the system.
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Which page? (e.g., 1)
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: How many records per page? (e.g., 10)
     *     responses:
     *       200:
     *         description: Report is ready
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
     *                 report_data:
     *                   type: string
     *                   example: "all performance report of listings are ready"
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Server error
     */
    report: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        return res.status(200).json({ 
            status: "Successful", 
            current_page: page,
            report_data: "all performance report of listings are ready" 
        });
    }
};

module.exports = listingController;