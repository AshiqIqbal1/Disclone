import { Schema } from "mongoose";
import mongoose from "../config/dbConfig.js";
;
;
;
;
export const DirectMessagesUserListSchema = new mongoose.Schema({
    recipientIdToDirectId: {
        type: Map,
        of: String,
        required: true
    }
});
export const invitationSchema = new mongoose.Schema({
    serverid: { type: Schema.Types.ObjectId, required: true },
    serverName: { type: String, required: true }
});
export const messageSchema = new mongoose.Schema({
    sentBy: { type: Schema.Types.ObjectId, required: true },
    sentByDisplayName: { type: String, required: true },
    sentProfilePic: { type: String, required: true },
    contentType: { type: Schema.Types.Mixed, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    timeSent: { type: Date, required: true }
});
export const directMessagesSchema = new mongoose.Schema({
    messages: { type: [messageSchema], required: true }
});
export default mongoose.model("DirectMessages", directMessagesSchema);
//# sourceMappingURL=directMesaages.js.map