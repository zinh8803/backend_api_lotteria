const fs = require('fs');
const path = require('path');

require("dotenv").config();

const mysql2 = require('mysql2/promise');
// const caPath = path.resolve(__dirname, '../../certs/ca.pem');

// const DB_SSL = process.env.DB_SSL === 'true';

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: true
    } : false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

};

// if (DB_SSL) {
//     config.ssl = {
//         ca: fs.readFileSync(caPath),
//         rejectUnauthorized: true,
//     };
// }

const db = mysql2.createPool(config);

module.exports = db;
