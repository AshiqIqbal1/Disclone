import { Schema } from "mongoose";
import mongoose from "../config/dbConfig.js";
import { DirectMessagesUserListSchema } from "./directMesaages.js";
const friendSchema = new mongoose.Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
    profilePic: { type: String, required: true },
    displayName: { type: String, required: true },
    status: { type: String, required: true },
    connectionStatus: { type: String, required: true },
    requestedBy: { type: Schema.Types.ObjectId, required: true },
});
const dateOfBirthSchema = new mongoose.Schema({
    day: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: String, required: true }
});
const userSchema = new mongoose.Schema({
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
//# sourceMappingURL=user.js.map