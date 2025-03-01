import User from "../models/user.js";
import Servers from "../models/servers.js";
import { Types } from "mongoose";
export async function createServer(ownerid, name) {
    const owner = User.findOne({ _id: ownerid });
    if (!owner) {
        throw new Error('Owner not found');
    }
    const generalChannelId = new Types.ObjectId();
    const newServer = new Servers({
        name: name,
        members: [ownerid],
        textChannels: [{
                id: generalChannelId,
                name: "general",
                messages: [],
            }],
        selectedChannel: generalChannelId
    });
    await newServer.save();
    return {};
}
;
export async function getServerInformation(serverid) {
    const server = Servers.findOne({ _id: serverid });
    if (!server) {
        throw new Error('Server not found');
    }
    return server;
}
;
export async function getServerList(userid) {
    const user = User.findOne({ _id: userid });
    if (!user) {
        throw new Error('User not found');
    }
    return await Servers.find({ members: userid }).select('_id name selectedChannel');
}
;
export async function textChannelSendMessage(serverid, channelid, userid, content) {
    const server = await Servers.findOne({ _id: serverid });
    if (!server) {
        throw new Error('Server not found');
    }
    const textChannel = server.textChannels.find((channel) => channel.id.toString() === channelid);
    if (!textChannel) {
        throw new Error('Server Channel not found');
    }
    const user = await User.findOne({ _id: userid });
    if (!user) {
        throw new Error('User is not a member');
    }
    const newMessage = {
        sentBy: user.id,
        sentByDisplayName: user.displayName,
        sentProfilePic: user.profilePic,
        contentType: "string",
        content: content,
        timeSent: new Date
    };
    textChannel.messages.push(newMessage);
    await server.save();
    return newMessage;
}
;
export async function getChannelInformation(serverid, channelid, userid) {
    const server = await Servers.findOne({ _id: serverid });
    if (!server) {
        throw new Error('Server not found');
    }
    const textChannel = server.textChannels.find((channel) => channel.id.toString() === channelid);
    if (!textChannel) {
        throw new Error('Server Channel not found');
    }
    const user = await User.findOne({ _id: userid });
    if (!user) {
        throw new Error('User is not a member');
    }
    return textChannel;
}
;
export async function createServerChannel(name, serverid) {
    const server = await Servers.findById(new Types.ObjectId(serverid));
    if (!server) {
        throw new Error('Server not found');
    }
    server.textChannels.push({
        id: new Types.ObjectId(),
        name: name,
        messages: []
    });
    await server.save();
    return {};
}
;
export async function joinFriendServer(userid, serverid) {
    const user = await User.findOne({ _id: userid });
    if (!user) {
        throw new Error('User is not a member');
    }
    const server = await Servers.findOne({ _id: serverid });
    if (!server) {
        throw new Error('Server not found');
    }
    server.members.push(user._id);
    await server.save();
    return {};
}
//# sourceMappingURL=manageServers.js.map