import User from "../models/user.js";

export interface profileInfo {
    username: string,
    displayName: string,
    profilePic: string,
    status: string,
    timeCreated: Date 
}

export async function getProfileInfo(
    requestid: string
): Promise<profileInfo> {
    const requestUser = await User.findOne({ _id: requestid });
    if (!requestUser) {
        throw new Error("Username provided is Invalid.");
    }

    return {
        username: requestUser.username,
        displayName: requestUser.displayName,
        profilePic: requestUser.profilePic,
        status: requestUser.status,
        timeCreated: requestUser.timeCreated
    };
};