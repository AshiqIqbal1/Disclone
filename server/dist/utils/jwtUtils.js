import jwt from "jsonwebtoken";
import key from "../config/jwtConfig.js";
export function generateToken(_id, username) {
    const payload = {
        id: _id,
        username: username
    };
    return jwt.sign(payload, key, { expiresIn: '1h' });
}
//# sourceMappingURL=jwtUtils.js.map