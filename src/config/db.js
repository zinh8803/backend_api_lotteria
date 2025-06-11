const fs = require('fs');
const path = require('path');

require("dotenv").config();

const mysql2 = require('mysql2/promise');
const caPath = path.resolve(__dirname, '../../certs/ca.pem');
const db = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = db;
