const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // ✅ Debug: See exactly what is received
        console.log("Received Authorization Header:", authHeader);

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided in Authorization header" });
        }

        // ✅ Ensure it starts with "Bearer "
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Invalid token format. Expected 'Bearer <token>'" });
        }

        // ✅ Extract the token safely
        const token = authHeader.split(" ")[1].trim();

        // ✅ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Attach decoded user info to request for downstream controllers
        req.user = decoded;

        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};
