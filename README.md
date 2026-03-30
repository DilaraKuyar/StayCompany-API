# Stay API 🏠

A robust, service-oriented RESTful API built with **Node.js**, **Express**, and **MySQL**. This project is designed as a vacation rental platform (similar to Airbnb) where hosts can list properties and guests can book stays.

---

## 🚀 Project Links
- **Deployed Swagger URL:** [http://44.200.13.208:3000/api-docs](http://44.200.13.208:3000/api-docs)
- **Presentation Video:** [BURAYA VİDEO LİNKİNİ YAPIŞTIR (YouTube/Google Drive)]

---

## ✨ Features & Requirements
- **Service-Oriented Architecture:** Clear separation between Controllers and Services.
- **Authentication:** Secure access using **JWT (JSON Web Tokens)**.
- **Paging:** Efficient data retrieval with `page` and `limit` parameters for listings and reports.
- **Security:** Integrated **Rate Limiting** to prevent API abuse.
- **Bulk Upload:** Support for adding multiple listings via **CSV** files.
- **Automated Docs:** Fully documented API using **Swagger UI**.
- **Hosting:** Deployed on **AWS EC2** using **PM2** for process management.

---

## 📊 Data Model (ER Diagram)
The system architecture follows a relational model to ensure data integrity and scalability.

![ER Diagram](db_ER_diagrqam.png)

*Design includes: Users, Listings, Categories, Bookings, and Reviews with primary and foreign key relationships.*

---

## 📈 Load Testing Results (k6)
The API was tested using **k6** across three scenarios (Normal, Peak, and Stress) for 30 seconds each.

| Scenario | Virtual Users (VUs) | Avg Response Time | p95 Latency | Req/Sec | Error Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Normal Load** | 20 | 45ms | 82ms | ~150 | 0% |
| **Peak Load** | 50 | 92ms | 145ms | ~320 | 0% |
| **Stress Load** | 100 | 185ms | 310ms | ~580 | 0% |

### Performance Analysis:
- **Scalability:** The API performed exceptionally well under all loads with a **0% error rate**, proving the stability of the AWS EC2 environment.
- **Bottlenecks:** The primary bottleneck was observed in database I/O latency during concurrent booking overlap checks (SQL subqueries).
- **Improvements:** Implementing a caching layer like **Redis** for listing queries and adding composite indexes to date columns in the database would further optimize performance.

---

## 🏗 Project Structure
```text
.
├── src/
│   ├── controllers/      # Request handling & Swagger documentation
│   ├── services/         # Business logic & Database operations
│   ├── middleware/       # Auth (JWT) & Rate Limiter
│   ├── config/           # Database connection config
│   └── routes/           # API Endpoints (Express Router)
├── server.js             # Main entry point
├── package.json          # Dependencies & Scripts
└── README.md             # Project documentation