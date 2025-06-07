const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary"); 
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ chấp nhận định dạng .png, .jpg, .jpeg!"), false);
    }
};

const createStorage = (folderName) =>
    new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folderName,
            allowed_formats: ["jpg", "png", "jpeg"],
            public_id: (req, file) => Date.now(),
        },
    });

const upload_product = multer({
    storage: createStorage("image_products"),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
}).single("image");

const upload_category = multer({
    storage: createStorage("image_categories"),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
}).single("image");

const upload_avatar = multer({
    storage: createStorage("image_avatars"),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
}).single("image");

module.exports = { upload_product, upload_category, upload_avatar };
