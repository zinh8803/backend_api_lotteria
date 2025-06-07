const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/ProductRoute");
const categoryRoutes = require("./routes/Categoryroute");
const userRoutes = require("./routes/UsersRoute");
const OrderRoutes = require("./routes/OrderRoute");
const PaymentRoutes = require("./routes/PaymentRoute");
const db = require("./config/db");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1");
        res.json({ status: 200, message: "✅ Kết nối DB thành công", data: rows });
    } catch (err) {
        console.error("❌ DB error:", err.message);
        res.status(500).json({ status: 500, message: err.message, data: null });
    }
});

app.use("/api", productRoutes);
app.use("/api", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/vnpay", PaymentRoutes);
app.use("/api/invoice", require("./routes/InvoiceRoute"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));
