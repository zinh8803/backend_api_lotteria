const db = require("../config/db");

const getAllCategories = async (req, res) => {
    try {
        const [result] = await db.execute("SELECT * FROM categories");

        res.status(200).json({
            status: 200,
            message: "Lấy danh sách danh mục thành công",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            "SELECT * FROM categories WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy danh mục",
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: "Lấy thông tin danh mục thành công",
            data: result[0]
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file ? req.file.path : null;

        const [result] = await db.execute(
            "INSERT INTO categories (name, image) VALUES (?, ?)",
            [name, image]
        );
        const data = {
            id: result.insertId,
            name: name,
            image: image
        };

        res.status(201).json({
            status: 201,
            message: "Danh mục được tạo thành công",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const image = req.file ? req.file.path : null;


        const [check] = await db.execute("SELECT * FROM categories WHERE id = ?", [id]);
        if (check.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy danh mục để cập nhật",
                data: null
            });
        }

        const updateFields = [];
        const values = [];

        if (name) {
            updateFields.push("name = ?");
            values.push(name);
        }
        if (image) {
            updateFields.push("image = ?");
            values.push(image);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Không có dữ liệu để cập nhật",
                data: null
            });
        }

        values.push(id); // Thêm ID vào cuối mảng values
        const query = `UPDATE categories SET ${updateFields.join(", ")} WHERE id = ?`;

        const [result] = await db.execute(query, values);

        res.status(200).json({
            status: 200,
            message: "Cập nhật danh mục thành công",
            data: {
                id,
                name: name || check[0].name,
                image: image || check[0].image
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const [check] = await db.execute("SELECT * FROM categories WHERE id = ?", [id]);
        if (check.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy danh mục để xóa",
                data: null
            });
        }

        const [result] = await db.execute(
            "DELETE FROM categories WHERE id = ?",
            [id]
        );

        res.status(200).json({
            status: 200,
            message: "Xóa danh mục thành công",
            data: null
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null
        });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};