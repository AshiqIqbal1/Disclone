import { Types } from "mongoose";
import User from "../models/user.js"
import DirectMessages, { Message } from "../models/directMesaages.js";

export async function getDirectMessageList(id: string) {
    const user = await User.findOne({ _id: id });
    if (!user) {
        throw new Error('User not found');
    }

    const recipientIds = Array.from(user.directMessages.recipientIdToDirectId.keys());
    
    if (recipientIds.length === 0) {
        return [];
    }

    const dmUsers = await User.find({ _id: { $in: recipientIds } }, 'id profilePic displayName status');

    return dmUsers.map((dmUser) => ({
        id: dmUser.id,
        profilePic: dmUser.profilePic,
        displayName: dmUser.displayName,
        status: dmUser.status
    }));
}

export async function getUserDirectMessages(id: string, recipient: string) {
    const user = await User.findOne({ _id: id });
    if (!user) {
        throw new Error('User not found');
    }

    let directid = user.directMessages.recipientIdToDirectId.get(recipient);

    if (!directid) {
        await addDirectMessage(id, recipient);
        directid = user.directMessages.recipientIdToDirectId.get(recipient);
    }

    return (await DirectMessages.findOne({ _id: directid})).messages;
};

export async function addDirectMessage(id: string, recipient: string) {
    const user = await User.findOne({ _id: id });
    if (!user) {
        throw new Error('User not found');
    }

    const receiver = await User.findOne({ _id: recipient });
    if (!receiver) {
        throw new Error('Recipient not found');
    }

    const newDirectMessage = new DirectMessages({
        messages: []
    });

    receiver.directMessages.recipientIdToDirectId.set(user._id.toString(), newDirectMessage._id.toString());
    user.directMessages.recipientIdToDirectId.set(receiver._id.toString(), newDirectMessage._id.toString());

    try {
        await newDirectMessage.save();  
        await user.save();            
        await receiver.save(); 
        console.log('Direct message created and saved');
    } catch (error) {
        console.error('Error saving direct message:', error);
        throw new Error('Failed to save direct message');
    }

    return {};
}

export async function sendMessage(
    id: string, 
    recipient: string, 
    contentType: string,
    content: string
) {
    const user = await User.findOne({ _id: id });
    if (!user) {
        throw new Error('User not found');
    }

    const receiver = await User.findOne({ _id: recipient });
    if (!receiver) {
        throw new Error('Recipient not found');
    }

    const directid = user.directMessages.recipientIdToDirectId.get(recipient);
    const directMessage = (await DirectMessages.findOne({ _id: directid}));

    const newMessage: Message = {
        sentBy: new Types.ObjectId(id),
        sentByDisplayName: user.displayName,
        sentProfilePic: user.profilePic,
        contentType: contentType,
        content: content,
        timeSent: new Date
    };
    
    directMessage.messages.push(newMessage);

    try {
        await directMessage.save()
    } catch (error) {
        throw new Error('Failed to save the new message in the direct message');
    }

    return newMessage;
}