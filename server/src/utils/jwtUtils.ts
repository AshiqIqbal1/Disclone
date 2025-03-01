import jwt from "jsonwebtoken";
import key from "../config/jwtConfig.js";
import { Types } from "mongoose";

export function generateToken(_id: Types.ObjectId, username: string) {
    const payload = {
        id: _id,
        username: username
    };   

    return jwt.sign(payload, key, { expiresIn: '1h'});
}