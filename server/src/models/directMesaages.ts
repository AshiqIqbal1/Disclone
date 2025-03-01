import { Schema, Types } from "mongoose";
import mongoose from "../config/dbConfig.js";

export interface Invitation {
    serverid: Types.ObjectId
    serverName: string
};

export interface Message {
    sentBy: Types.ObjectId,
    sentByDisplayName: string,
    sentProfilePic: string,
    contentType: string,
    content: string | Invitation,
    timeSent: Date 
};

export interface DirectMessages {
    messages: Message[]
};

export interface DirectMessagesUserList {
    recipientIdToDirectId: Map<string, string>
};

export const DirectMessagesUserListSchema = new mongoose.Schema<DirectMessagesUserList>({
    recipientIdToDirectId: {
        type: Map,
        of: String,
        required: true
    }
});

export const invitationSchema = new mongoose.Schema<Invitation>({
    serverid: { type: Schema.Types.ObjectId, required: true },
    serverName: { type: String, required: true }
});

export const messageSchema = new mongoose.Schema<Message>({
    sentBy: { type: Schema.Types.ObjectId, required: true },
    sentByDisplayName: { type: String, required: true },
    sentProfilePic: { type: String, required: true },
    contentType: { type: Schema.Types.Mixed, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    timeSent: { type: Date, required: true }
});

export const directMessagesSchema = new mongoose.Schema<DirectMessages>({
    messages: { type: [messageSchema], required: true }
});

export default mongoose.model("DirectMessages", directMessagesSchema);

