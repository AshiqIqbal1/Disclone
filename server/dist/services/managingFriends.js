import User from "../models/user.js";
export async function sendFriendRequest(senderUsername, receiverUsername) {
    const sender = await User.findOne({ username: senderUsername });
    const receiver = await User.findOne({ username: receiverUsername });
    if (!receiver || senderUsername === receiverUsername) {
        throw new Error("Username provided is Invalid.");
    }
    sender.friends.push({
        id: receiver._id,
        username: receiver.username,
        profilePic: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSuV3pnrrgeSNYPADFteFSiKUUFgD-04hYBA&s",
        displayName: receiver.displayName,
        status: receiver.status,
        connectionStatus: "pending",
        requestedBy: sender.id
    });
    receiver.friends.push({
        id: sender._id,
        username: sender.username,
        profilePic: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSuV3pnrrgeSNYPADFteFSiKUUFgD-04hYBA&s",
        displayName: sender.displayName,
        status: sender.status,
        connectionStatus: "pending",
        requestedBy: sender.id
    });
    await sender.save();
    await receiver.save();
    return {};
}
;
export async function acceptFriendRequest(userid, friendid) {
    const user = await User.findById(userid);
    if (!user) {
        throw new Error("The requesting user does not exist.");
    }
    const friend = await User.findById(friendid);
    if (!friend) {
        throw new Error("The specified user to be added as a friend does not exist.");
    }
    user.friends.find((friend) => friend.id.toString() === friendid.toString()).connectionStatus = "connected";
    friend.friends.find((friend) => friend.id.toString() === userid).connectionStatus = "connected";
    await user.save();
    await friend.save();
    return {};
}
;
export async function getFriends(id) {
    const user = await User.findOne({ _id: id });
    if (!user) {
        throw new Error('User not found');
    }
    const friendStatuses = await Promise.all(user.friends.map(async (friend) => {
        const friendUser = await User.findById(friend.id.toString());
        if (!friendUser) {
            throw new Error(`Friend with id ${friend.id} not found`);
        }
        friend.status = friendUser.status;
        await friendUser.save();
        return friend;
    }));
    return friendStatuses;
}
;
//# sourceMappingURL=managingFriends.js.map