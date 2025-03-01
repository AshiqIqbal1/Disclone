import User from "../models/user.js";
export async function getProfileInfo(requestid) {
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
}
;
//# sourceMappingURL=manageUsers.js.map