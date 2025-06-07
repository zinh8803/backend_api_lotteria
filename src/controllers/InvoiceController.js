
const db = require("../config/db");
const getallinvoice = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                i.invoice_id,
                i.invoice_date,
                i.status AS invoice_status,
                o.order_id,
                o.order_date,
                o.name AS customer_name,
                o.phone_number,
                o.address,
                o.payment_method,
                o.total_amount,
                o.status AS order_status,
                u.username,
                u.email
            FROM invoices i
            JOIN orders o ON i.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id
            WHERE i.status = 'active'
            ORDER BY i.invoice_date DESC;
        `);

        res.status(200).json({
            status: 200,
            message: "Lấy danh sách hóa đơn thành công",
            data: rows,
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
    getallinvoice
};