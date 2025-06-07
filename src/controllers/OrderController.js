const db = require("../config/db");
const jwt = require("jsonwebtoken");
const createOrder = async (req, res) => {
    try {
        const { user_id, products, name, phone_number, address, payment_method } = req.body;

        if (!user_id) {
            return res.status(400).json({
                status: 400,
                message: "Thiếu user_id trong body",
                data: null,
            });
        }
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Danh sách sản phẩm không hợp lệ",
                data: null,
            });
        }
        if (!name || !phone_number || !address || !payment_method) {
            return res.status(400).json({
                status: 400,
                message: "Thiếu thông tin bắt buộc (name, phone_number, address, payment_method)",
                data: null,
            });
        }

        const [user] = await db.execute(
            "SELECT user_id FROM users WHERE user_id = ?",
            [user_id]
        );
        if (user.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy user",
                data: null,
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            let total_amount = 0;
            for (const item of products) {
                const [product] = await connection.execute(
                    "SELECT product_id, price, stock FROM products WHERE product_id = ?",
                    [item.product_id]
                );
                if (product.length === 0) {
                    throw new Error(`Sản phẩm với ID ${item.product_id} không tồn tại`);
                }
                if (product[0].stock < item.quantity) {
                    throw new Error(`Số lượng tồn kho của sản phẩm ${item.product_id} không đủ`);
                }
                const subtotal = product[0].price * item.quantity;
                total_amount += subtotal;
            }

            const [orderResult] = await connection.execute(
                "INSERT INTO orders (user_id, order_date, name, phone_number, address, payment_method, total_amount, status) VALUES (?, NOW(), ?, ?, ?, ?, ?, 'purchased')",
                [user_id, name, phone_number, address, payment_method, total_amount]
            );
            const order_id = orderResult.insertId;

            for (const item of products) {
                const [product] = await connection.execute(
                    "SELECT price FROM products WHERE product_id = ?",
                    [item.product_id]
                );
                const subtotal = product[0].price * item.quantity;

                await connection.execute(
                    "INSERT INTO order_details (order_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)",
                    [order_id, item.product_id, item.quantity, subtotal]
                );

                await connection.execute(
                    "UPDATE products SET stock = stock - ? WHERE product_id = ?",
                    [item.quantity, item.product_id]
                );
            }

            await connection.execute(
                "INSERT INTO invoices (order_id, invoice_date, status) VALUES (?, NOW(), 'active')",
                [order_id]
            );

            await connection.commit();

            res.status(201).json({
                status: 201,
                message: "Tạo đơn hàng thành công",
                data: { order_id, user_id, total_amount, order_date: new Date(), status: "purchased" },
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null,
        });
    }
};
const cancelOrder = async (req, res) => {
    try {
        const { id, user_id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 400,
                message: "Thiếu order_id trong URL",
                data: null,
            });
        }
        if (!user_id || user_id.trim() === "") {
            return res.status(400).json({
                status: 400,
                message: "Thiếu hoặc không hợp lệ user_id trong URL",
                data: null,
            });
        }

        const [user] = await db.execute(
            "SELECT user_id FROM users WHERE user_id = ?",
            [user_id]
        );
        if (user.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy user",
                data: null,
            });
        }

        const [order] = await db.execute(
            "SELECT order_id, status FROM orders WHERE order_id = ? AND user_id = ?",
            [id, user_id]
        );
        if (order.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy đơn hàng",
                data: null,
            });
        }

        if (order[0].status === "canceled") {
            return res.status(400).json({
                status: 400,
                message: "Đơn hàng đã bị hủy trước đó",
                data: null,
            });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [details] = await connection.execute(
                "SELECT product_id, quantity FROM order_details WHERE order_id = ?",
                [id]
            );

            for (const item of details) {
                await connection.execute(
                    "UPDATE products SET stock = stock + ? WHERE product_id = ?",
                    [item.quantity, item.product_id]
                );
            }

            await connection.execute(
                "UPDATE orders SET status = 'canceled' WHERE order_id = ?",
                [id]
            );

            await connection.execute(
                "UPDATE invoices SET status = 'canceled' WHERE order_id = ?",
                [id]
            );

            await connection.commit();

            res.status(200).json({
                status: 200,
                message: "Hủy đơn hàng thành công",
                data: null,
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null,
        });
    }
};
// Lấy danh sách đơn hàng của người dùng
const getUserOrders = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                status: 401,
                message: "Bạn cần phải đăng nhập",
                data: null
            });
        }

        const decoded = jwt.verify(token, process.env.SECRETKEY);
        const { user_id } = decoded;

        const [orders] = await db.execute(
            "SELECT order_id, order_date, total_amount, payment_method, name, phone_number, address, status " +
            "FROM orders " +
            "WHERE user_id = ? " +
            "ORDER BY order_id DESC",
            [user_id]
        );


        if (orders.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy đơn hàng",
                data: null,
            });
        }

        const result = [];
        for (const order of orders) {
            const [details] = await db.execute(
                "SELECT od.order_detail_id, od.product_id, od.quantity, od.subtotal, p.name, p.image, p.price " +
                "FROM order_details od " +
                "JOIN products p ON od.product_id = p.product_id " +
                "WHERE od.order_id = ?",
                [order.order_id]
            );
            result.push({
                ...order,
                details: details,
            });
        }

        res.status(200).json({
            status: 200,
            message: "Lấy danh sách đơn hàng thành công",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null,
        });
    }
};
// Lấy chi tiết một đơn hàng
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;


        // const token = req.headers.authorization?.split(" ")[1];

        // if (!token) {
        //     return res.status(401).json({
        //         status: 401,
        //         message: "Bạn cần phải đăng nhập",
        //         data: null
        //     });
        // }
        // const decoded = jwt.verify(token, process.env.SECRETKEY);
        // const { user_id } = decoded;

        // if (!id) {
        //     return res.status(400).json({
        //         status: 400,
        //         message: "Thiếu order_id trong URL",
        //         data: null,
        //     });
        // }



        // const [user] = await db.execute(
        //     "SELECT user_id FROM users WHERE user_id = ?",
        //     [user_id]
        // );

        // if (user.length === 0) {
        //     return res.status(404).json({
        //         status: 404,
        //         message: "Không tìm thấy user",
        //         data: null,
        //     });
        // }

        const [order] = await db.execute(
            `SELECT o.order_id, o.order_date, o.total_amount, o.payment_method, 
                    o.name, o.phone_number, o.address, o.status
             FROM orders o
             WHERE o.order_id = ?`,
            [id]
        );

        if (order.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy đơn hàng",
                data: null,
            });
        }

        const [details] = await db.execute(
            `SELECT od.order_detail_id, od.product_id, od.quantity, od.subtotal, p.price,
                    p.name, p.image
             FROM order_details od
             JOIN products p ON od.product_id = p.product_id
             WHERE od.order_id = ?`,
            [id]
        );

        const orderData = {
            ...order[0],
            details,
        };

        return res.status(200).json({
            status: 200,
            message: "Lấy chi tiết đơn hàng thành công",
            data: orderData,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: null,
        });
    }
};

// Lấy tất cả đơn hàng (cho admin)
const getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.execute(
            "SELECT o.order_id, o.user_id, o.order_date, o.total_amount, o.payment_method, o.name, o.phone_number, o.address, o.status, u.username " +
            "FROM orders o " +
            "JOIN users u ON o.user_id = u.user_id " +
            "ORDER BY o.order_id DESC"
        );

        if (orders.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy đơn hàng",
                data: null,
            });
        }

        const result = [];
        for (const order of orders) {
            const [details] = await db.execute(
                "SELECT od.order_detail_id, od.product_id, od.quantity, od.subtotal, p.name, p.image, p.price " +
                "FROM order_details od " +
                "JOIN products p ON od.product_id = p.product_id " +
                "WHERE od.order_id = ?",
                [order.order_id]
            );

            result.push({
                ...order,
                details: details,
            });
        }

        res.status(200).json({
            status: 200,
            message: "Lấy danh sách tất cả đơn hàng thành công",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null,
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    cancelOrder,
};