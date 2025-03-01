import { Schema, Types } from "mongoose";
import mongoose from "../config/dbConfig.js";
import { DirectMessagesUserList, DirectMessagesUserListSchema } from "./directMesaages.js";

export interface DateOfBirth {
    day: string,
    month: string,
    year: string
}

export interface Friend {
    id: Types.ObjectId,
    username: string,
    profilePic: string,
    displayName: string,
    status: string,
    connectionStatus: string,
    requestedBy: Types.ObjectId
}

export interface UserData {
    email: string,
    displayName: string,
    username: string,
    password: string,
    dateOfBirth: DateOfBirth,
    profilePic: string,
    timeCreated: Date,
    status: string,
    friends: Friend[],
    directMessages: DirectMessagesUserList,
}

const friendSchema = new mongoose.Schema<Friend>({
    id: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
    profilePic: { type: String, required: true },
    displayName: { type: String, required: true },
    status: { type: String, required: true },
    connectionStatus: { type: String, required: true },
    requestedBy: { type: Schema.Types.ObjectId, required: true },
});

const dateOfBirthSchema = new mongoose.Schema<DateOfBirth>({
    day: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: String, required: true }
});

const userSchema = new mongoose.Schema<UserData>({
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: dateOfBirthSchema, required: true },
    profilePic: { type: String, required: true },
    timeCreated: { type: Date, required: true },
    status: { type: String, required: true },
    friends: { type: [friendSchema], required: true },
    directMessages: { type: DirectMessagesUserListSchema, required: true }
});

export default mongoose.model("User", userSchema);