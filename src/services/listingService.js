const db = require('../config/db');

class ListingService {
    // Veritabanına yeni ilan ekleyen asıl fonksiyon
    async createListing(listingData) {
        const { host_id, no_of_people, country, city, price } = listingData;
        
        const query = `INSERT INTO Listings (host_id, no_of_people, country, city, price) 
                       VALUES (?, ?, ?, ?, ?)`;
        
        // db.js'den gelen pool (bağlantı havuzu) üzerinden sorguyu çalıştırıyoruz
        const [result] = await db.execute(query, [host_id, no_of_people, country, city, price]);
        return result;
    }

    // İleride "Query Listings" (Arama) için burayı kullanacağız
    async getAllListings() {
        const [rows] = await db.execute('SELECT * FROM Listings');
        return rows;
    }
        // Arama fonksiyonu (Misafirler için)
async queryListings(params) {
    const { from, to, no_of_people, country, city, page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    // Görseldeki kural: Rezervasyonu olan evleri getirme
    // SQL'de "NOT EXISTS" kullanarak o tarihlerde çakışan rezervasyonu olmayanları seçiyoruz
    const query = `
        SELECT l.* FROM Listings l
        WHERE l.no_of_people >= ? 
        AND l.country = ? 
        AND l.city = ?
        AND NOT EXISTS (
            SELECT 1 FROM Bookings b 
            WHERE b.listing_id = l.id 
            AND (
                (b.from_date <= ? AND b.to_date >= ?) OR
                (b.from_date <= ? AND b.to_date >= ?)
            )
        )
        LIMIT ? OFFSET ?`;

    const [rows] = await db.execute(query, [
        no_of_people, country, city, 
        to, from, from, to, 
        parseInt(limit), parseInt(offset)
    ]);
    return rows;
}
async createManyListings(listingsArray) {
        const query = 'INSERT INTO Listings (host_id, no_of_people, country, city, price) VALUES ?';
        // Bulk insert (toplu ekleme) için veriyi uygun formata getiriyoruz
        const values = listingsArray.map(l => [l.host_id, l.no_of_people, l.country, l.city, l.price]);
        const [result] = await db.query(query, [values]);
        return result;
    }
    async bookAStay(bookingData) {
        const { listing_id, guest_id, from_date, to_date } = bookingData;

        // ÇAKIŞMA KONTROLÜ: Aynı tarihlerde başka bir rezervasyon var mı?
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
        const { country, city, no_of_people, page = 1, limit = 10 } = params;
        
        // Kaçıncı kayıttan başlayacağını hesapla (Örn: 2. sayfa için 10 kayıt atla)
        const offset = (page - 1) * limit;

        const query = `
            SELECT * FROM Listings 
            WHERE country = ? AND city = ? AND no_of_people >= ?
            LIMIT ? OFFSET ?`;
            
        const [rows] = await db.execute(query, [country, city, no_of_people, String(limit), String(offset)]);
        return rows;
    }
}


module.exports = new ListingService();