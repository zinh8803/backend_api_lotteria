const jwt = require('jsonwebtoken');

const checkAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            status: 401,
            message: "Không có quyền truy cập",
            data: null
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRETKEY);

        if (decoded.isAdmin !== 1) {
            return res.status(403).json({
                status: 403,
                message: "Bạn không có quyền truy cập vào tài nguyên này",
                data: null
            });
        }

        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            status: 401,
            message: "Token không hợp lệ",
            data: null
        });
    }
};

const checkUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            status: 401,
            message: "Không có quyền truy cập",
            data: null
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRETKEY);

        if (decoded.isAdmin !== 0 && decoded.isAdmin !== 1) {
            return res.status(403).json({
                status: 403,
                message: "Bạn không có quyền truy cập vào tài nguyên này",
                data: null
            });
        }

        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            status: 401,
            message: "Token không hợp lệ",
            data: null
        });
    }
};

module.exports = {
    checkAdmin,
    checkUser
};
