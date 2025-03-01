import mongoose from "../config/dbConfig.js";
import { Schema, Types } from "mongoose";
import { Message, messageSchema } from "./directMesaages.js";

export interface TextChannel {
    id: Types.ObjectId,
    name: string,
    messages: Message[]
};

export interface ServerType {
    name: string,
    members: Types.ObjectId[],
    textChannels: TextChannel[],
    selectedChannel: Types.ObjectId
};

const textChannelSchema = new mongoose.Schema<TextChannel>({
    id: { type: Schema.Types.ObjectId, required: true, unique: true },
    name: { type: String, required: true },
    messages: { type: [messageSchema], required: true },
});

const serverSchema = new mongoose.Schema<ServerType>({
    name: { type: String, required: true },
    members: { type: [Schema.Types.ObjectId], required: true },
    textChannels: { type: [textChannelSchema], required: true },
    selectedChannel: { type: Schema.Types.ObjectId, required: true },
});

export default mongoose.model<ServerType>("Servers", serverSchema);
