import jwt from "jsonwebtoken";
import key from "../config/jwtConfig.js";
import { NextFunction, Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
    user?: jwt.JwtPayload;
}

export function verifyToken(token: string) {
    try {
        const payload = jwt.verify(token, key);
        if (typeof payload === "object" && payload !== null && "id" in payload) {
            return payload;
        } else {
            throw new Error("Invalid token payload");
        }
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided." });
    }

    const user = verifyToken(token);
    if (!user) {
        res.status(403).json({ message: "Forbidden: Invalid token." });
    }

    req.user = user; 
    next();
}