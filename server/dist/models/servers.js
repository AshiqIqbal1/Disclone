import mongoose from "../config/dbConfig.js";
import { Schema } from "mongoose";
import { messageSchema } from "./directMesaages.js";
;
;
const textChannelSchema = new mongoose.Schema({
    id: { type: Schema.Types.ObjectId, required: true, unique: true },
    name: { type: String, required: true },
    messages: { type: [messageSchema], required: true },
});
const serverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: { type: [Schema.Types.ObjectId], required: true },
    textChannels: { type: [textChannelSchema], required: true },
    selectedChannel: { type: Schema.Types.ObjectId, required: true },
});
export default mongoose.model("Servers", serverSchema);
//# sourceMappingURL=servers.js.map