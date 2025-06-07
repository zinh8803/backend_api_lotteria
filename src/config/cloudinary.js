const cloudinary = require('cloudinary').v2;
require('dotenv').config();
cloudinary.config({
    cloud_name: process.env.CLOUDENAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.APISECREC,
});

module.exports = cloudinary;
