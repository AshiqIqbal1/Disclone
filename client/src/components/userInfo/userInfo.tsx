import { useEffect, useState } from "react";
import classes from "./userInfo.module.css";
import { profileInfo } from "../directMessageRightBar/directMessageRightBar";

export default function UserInfo() {
    const [profile, setProfile] = useState<profileInfo>({
        username: "",
        displayName: "",
        profilePic: "",
        status: "string",
        timeCreated: new Date
    });

    const getUserInfo = async () => {
        try {
            const response = await fetch("https://discloned.up.railway.app/user/info", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("Authorization")
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.message} Status: ${response.status}`);
            }
            
            const output = await response.json();
            setProfile(output.profile);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getUserInfo();
    }, []);
    
    return (
        <section className={classes.userProfileWrapper}>
            <div className={classes.userProfile}>
                <img className={classes.userProfileIcon} src={profile.profilePic} alt=""/>
                <div className={classes.userProfileInfo}>
                    <div className={classes.userProfileDisplayName}>
                        {profile.displayName}
                    </div>
                    <div className={classes.userProfileStatus}>
                        {profile.status}
                    </div>
                </div>
            </div>
        </section>
    );
}