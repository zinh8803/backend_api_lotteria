const fs = require('fs');
const path = require('path');

require("dotenv").config();

const mysql2 = require('mysql2/promise');
const DB_SSL = process.env.DB_SSL === 'true';
const caPath = path.resolve(__dirname, '../../certs/ca.pem');
const db = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

});
if (DB_SSL) {
    db.ssl = {
        ca: fs.readFileSync(caPath), // dùng CA hợp lệ
        rejectUnauthorized: true,
    };
}
module.exports = db;
