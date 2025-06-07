const db = require("../config/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const registerUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const [existingUser] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Tên email đã tồn tại",
                data: null
            });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await db.execute(
            "INSERT INTO users (username, password, email) VALUES (?, ?,  ?)",
            [username, hashedPassword, email]);

        const data = {
            user_id: result.insertId,
            username,
            email,
        };

        res.status(201).json({
            status: 201,
            message: "Đăng ký người dùng thành công",
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


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [user] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        if (user.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Tên người dùng không tồn tại",
                data: null
            });
        }

        const match = await bcrypt.compare(password, user[0].password);
        if (!match) {
            return res.status(400).json({
                status: 400,
                message: "Mật khẩu không đúng",
                data: null
            });
        }

        const payload = {
            user_id: user[0].user_id,
            username: user[0].username,
            email: user[0].email,
            isAdmin: user[0].isAdmin
        };
        // console.log(payload);
        const token = jwt.sign(payload, process.env.SECRETKEY, { expiresIn: '10h' });

        const data = {
            user_id: user[0].user_id,
            username: user[0].username,
            email: user[0].email,
            avatar: user[0].avatar,
            isAdmin: user[0].isAdmin
        };

        res.status(200).json({
            status: 200,
            message: "Đăng nhập thành công",
            data,
            token: token
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null
        });
    }
};



const getUserById = async (req, res) => {
    try {
        // Lấy token từ header Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                status: 401,
                message: "Không có quyền truy cập",
                data: null
            });
        }

        const decoded = jwt.verify(token, process.env.SECRETKEY);

        const [result] = await db.execute(
            "SELECT * FROM users WHERE user_id = ?",
            [decoded.user_id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy người dùng",
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: "Lấy thông tin người dùng thành công",
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



const updateUser = async (req, res) => {
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

        const { username, email, password, phone_number, address } = req.body;
        const avatar = req.file ? req.file.path : null;


        const [check] = await db.execute(
            "SELECT * FROM users WHERE user_id = ?",
            [user_id]
        );
        if (check.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy người dùng để cập nhật",
                data: null
            });
        }



        const updateFields = [];
        const values = [];

        if (username) {
            updateFields.push("username = ?");
            values.push(username);
        }
        if (email) {
            updateFields.push("email = ?");
            values.push(email);
        }
        if (phone_number) {
            updateFields.push("phone_number = ?");
            values.push(phone_number);
        }
        if (address) {
            updateFields.push("address = ?");
            values.push(address);
        }
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateFields.push("password = ?");
            values.push(hashedPassword);
        }
        if (avatar) {
            updateFields.push("avatar = ?");
            values.push(avatar);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Không có dữ liệu để cập nhật",
                data: null
            });
        }

        values.push(user_id);
        const query = `UPDATE users SET ${updateFields.join(", ")} WHERE user_id = ?`;

        const [result] = await db.execute(query, values);

        const [updatedUser] = await db.execute(
            "SELECT user_id, username, email, phone_number, address, avatar FROM users WHERE user_id = ?",
            [user_id]
        );

        res.status(200).json({
            status: 200,
            message: "Cập nhật người dùng thành công",
            data: updatedUser[0]
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message,
            data: null
        });
    }
};
const updateAvatar = async (req, res) => {
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

        if (!req.file) {
            return res.status(400).json({
                status: 400,
                message: "Vui lòng chọn ảnh để cập nhật avatar",
                data: null
            });
        }

        const avatar = req.file ? req.file.path : null;



        await db.execute(
            "UPDATE users SET avatar = ? WHERE user_id = ?",
            [avatar, user_id]
        );

        const [user] = await db.execute(
            "SELECT user_id, username, email, phone_number, address, avatar FROM users WHERE user_id = ?",
            [user_id]
        );

        return res.status(200).json({
            status: 200,
            message: "Cập nhật avatar thành công",
            data: user[0],
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
            data: null
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [check] = await db.execute(
            "SELECT * FROM users WHERE user_id = ?",
            [id]
        );
        if (check.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy người dùng để xóa",
                data: null
            });
        }

        const [result] = await db.execute(
            "DELETE FROM users WHERE user_id = ?",
            [id]
        );

        res.status(200).json({
            status: 200,
            message: "Xóa người dùng thành công",
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

const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        status: 200,
        message: "Đăng xuất thành công",
        data: null
    });
};


const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            status: 400,
            message: err.message,
            data: null
        });
    } else if (err) {
        return res.status(400).json({
            status: 400,
            message: err.message,
            data: null
        });
    }
    next();
};

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    updateUser,
    deleteUser,
    updateAvatar,
    logout
};