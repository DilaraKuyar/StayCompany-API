const db = require('../config/db');

class ListingService {
    // 1. Yeni İlan Ekleme
    async createListing(listingData) {
        const { host_id, no_of_people, country, city, price } = listingData;
        const query = `INSERT INTO Listings (host_id, no_of_people, country, city, price) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [host_id, no_of_people, country, city, price]);
        return result;
    }

    // 2. Tüm İlanları Getirme
    async getAllListings() {
        const [rows] = await db.execute('SELECT * FROM Listings');
        return rows;
    }

    // 3. Toplu İlan Yükleme (CSV)
    async createManyListings(listingsArray) {
        const query = 'INSERT INTO Listings (host_id, no_of_people, country, city, price) VALUES ?';
        const values = listingsArray.map(l => [l.host_id, l.no_of_people, l.country, l.city, l.price]);
        const [result] = await db.query(query, [values]);
        return result;
    }

    async bookAStay(bookingData) {
        const { listing_id, guest_id, from_date, to_date } = bookingData;

        const checkQuery = `
            SELECT * FROM Bookings 
            WHERE listing_id = ? 
            AND (
                (from_date <= ? AND to_date >= ?) OR 
                (from_date <= ? AND to_date >= ?)
            )`;
        
        const [existing] = await db.execute(checkQuery, [listing_id, to_date, from_date, from_date, to_date]);

        if (existing.length > 0) {
            throw new Error("Bu tarihlerde ev zaten dolu!");
        }

        const insertQuery = 'INSERT INTO Bookings (listing_id, guest_id, from_date, to_date) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(insertQuery, [listing_id, guest_id, from_date, to_date]);
        return result;
    }

    async queryListings(params) {
       
        const { country, city, no_of_people = 1, page = 1, limit = 10 } = params;
        
        const limitNumber = parseInt(limit);
        const offsetNumber = (parseInt(page) - 1) * limitNumber;

        const query = `
            SELECT * FROM Listings 
            WHERE country = ? AND city = ? AND no_of_people >= ?
            LIMIT ? OFFSET ?`;
            
        const [rows] = await db.execute(query, [
            country, 
            city, 
            parseInt(no_of_people), 
            limitNumber, 
            offsetNumber
        ]);
        return rows;
    }
}

module.exports = new ListingService();