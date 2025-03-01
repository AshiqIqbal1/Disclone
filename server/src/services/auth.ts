import User, { DateOfBirth } from "../models/user.js"
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwtUtils.js";
import { verifyToken } from "../utils/verifyToken.js";
import { JwtPayload } from "jsonwebtoken";

export async function registerUser(
    email: string, 
    displayName: string,
    username: string,
    password: string,
    dateOfBirth: DateOfBirth
) {
    const existingUsername = await User.findOne({ username: username });
    try {
        if (!existingUsername) {
            const newUser = new User({
                email,
                displayName,
                username,
                password: await bcrypt.hash(password, 10),
                dateOfBirth,
                profilePic: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSuV3pnrrgeSNYPADFteFSiKUUFgD-04hYBA&s",
                timeCreated: new Date,
                status: "offline",
                friendRequests: {
                    sentRequests: [],
                    receivedRequests: []
                },
                friends: [],
                directMessages: {
                    recipientIdToDirectId: new Map<string, string>()
                }
            });

            const savedUser = await newUser.save();
            return savedUser;
        } else {
            throw new Error(`Username has been taken.`);
        }
    } catch (error) {
        throw new Error(error);
    }
}

export async function loginUser(email: string, password: string) {
    const existingUser = await User.findOne({ email: email });
    try {
        if (!existingUser) {
            throw new Error(`Invalid credentials.`);
        } else if (!bcrypt.compare(password, existingUser.password)) {
            throw new Error(`Incorrect password.`);
        } else {
            return generateToken(existingUser._id, existingUser.username);
        }
    } catch (error) {
        throw new Error(error);
    }
}

export async function refreshToken(oldToken: string) {
    try {
        const decodedToken = verifyToken(oldToken);
        const user = await User.findById((decodedToken as JwtPayload)._id);
        if (!user) {
            throw new Error("Invalid token!");
        }
    
        const newToken = generateToken(user._id, "");
        return newToken;
    } catch (error) {
        console.error(error);
    }
}