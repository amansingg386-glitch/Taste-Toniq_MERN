import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        req.body.userId = "guest";
        return next();
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_key");
        req.body.userId = token_decode.id;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error decrypting token." });
    }
}

export default authMiddleware;
