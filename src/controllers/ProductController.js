const db = require("../config/db");

const getAllProducts = async (req, res) => {
    try {
        const [result] = await db.execute(`
                select * from products 
            `);

        res.status(200).json({
            status: 200,
            message: "Lấy danh sách sản phẩm thành công",
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
const searchProductsByName = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                status: 400,
                message: "Thiếu tên sản phẩm cần tìm",
                data: null,
            });
        }

        const [results] = await db.execute(
            "SELECT product_id, name, price, image FROM products WHERE name LIKE ?",
            [`%${name}%`]
        );

        if (results.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy sản phẩm nào",
                data: [],
            });
        }

        res.status(200).json({
            status: 200,
            message: "Tìm kiếm sản phẩm thành công",
            data: results,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Lỗi server: " + error.message,
            data: null,
        });
    }
};

const getallproductsbycategory = async (req, res) => {
    try {
        const { category_id } = req.params;

        const [result] = await db.execute(
            `
             select * from products where category_id = ?
            `,
            [category_id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy sản phẩm",
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: "Lấy thông tin sản phẩm thành công",
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

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            `
             select * from products where product_id = ?
            `,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy sản phẩm",
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: "Lấy thông tin sản phẩm thành công",
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

const createProduct = async (req, res) => {
    try {
        const { name, price, description, stock, category_id } = req.body;
        const image = req.file ? req.file.path : null;

        const [categoryCheck] = await db.execute(
            "SELECT * FROM categories WHERE id = ?",
            [category_id]
        );
        if (categoryCheck.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Danh mục không tồn tại",
                data: null
            });
        }

        const [result] = await db.execute(
            "INSERT INTO products (name, image, price, description, stock, category_id) VALUES (?, ?, ?, ?, ?, ?)",
            [name, image, price, description, stock, category_id]
        );

        const data = {
            product_id: result.insertId,
            name,
            image,
            price,
            description,
            stock,
            category_id
        };

        res.status(201).json({
            status: 201,
            message: "Sản phẩm được tạo thành công",
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


const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, stock, category_id } = req.body;
        const image = req.file ? req.file.path : null;


        const [check] = await db.execute(
            "SELECT * FROM products WHERE product_id = ?",
            [id]
        );
        if (check.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy sản phẩm để cập nhật",
                data: null
            });
        }

        if (category_id) {
            const [categoryCheck] = await db.execute(
                "SELECT * FROM categories WHERE id = ?",
                [category_id]
            );
            if (categoryCheck.length === 0) {
                return res.status(400).json({
                    status: 400,
                    message: "Danh mục không tồn tại",
                    data: null
                });
            }
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
        if (price) {
            updateFields.push("price = ?");
            values.push(price);
        }
        if (description) {
            updateFields.push("description = ?");
            values.push(description);
        }
        if (stock) {
            updateFields.push("stock = ?");
            values.push(stock);
        }
        if (category_id) {
            updateFields.push("category_id = ?");
            values.push(category_id);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Không có dữ liệu để cập nhật",
                data: null
            });
        }

        values.push(id);
        const query = `UPDATE products SET ${updateFields.join(", ")} WHERE product_id = ?`;

        const [result] = await db.execute(query, values);

        res.status(200).json({
            status: 200,
            message: "Cập nhật sản phẩm thành công",
            data: {
                product_id: id,
                name: name || check[0].name,
                image: image || check[0].image,
                price: price || check[0].price,
                description: description || check[0].description,
                stock: stock || check[0].stock,
                category_id: category_id || check[0].category_id
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

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const [check] = await db.execute(
            "SELECT * FROM products WHERE product_id = ?",
            [id]
        );
        if (check.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy sản phẩm để xóa",
                data: null
            });
        }

        const [result] = await db.execute(
            "DELETE FROM products WHERE product_id = ?",
            [id]
        );

        res.status(200).json({
            status: 200,
            message: "Xóa sản phẩm thành công",
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
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getallproductsbycategory,
    searchProductsByName
};