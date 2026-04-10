import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Not Authorized, Login Again" });
        }
        
        // We compare against an Admin Token stored in .env
        const adminToken = process.env.ADMIN_TOKEN || "admin_secret_123";
        
        if (token === adminToken) {
             next();
        } else {
             return res.json({ success: false, message: "Not Authorized, Admin Only" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export default adminAuth;
