import { useParams } from "react-router-dom";
import classes from "./directMessageRightBar.module.css"
import { useEffect, useState } from "react";

export interface profileInfo {
    username: string,
    displayName: string,
    profilePic: string,
    status: string,
    timeCreated: Date 
};

export default function DirectMessageRightBar({ getProfile }) {

    const { recipient } = useParams();
    const [profile, setProfile] = useState<profileInfo>({
        username: "",
        displayName: "",
        profilePic: "",
        status: "string",
        timeCreated: new Date
    });

    const renderMemberSince = () => {
        const date = new Date(profile.timeCreated);
        const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
        return date.toLocaleDateString("en-US", options);
    };

    const getProfileInformation = async () => {
        try {
            const response = await fetch(`http://localhost:5001/profile/${recipient}`, {
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
            getProfile(output.profile);
            
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getProfileInformation();
    }, [])

    return (
        <div className={classes.profileWrapper}>
            <header className={classes.bannerHeader}>
                <svg className={classes.profileBanner}>
                    <mask id="circleMask">
                        <rect className={classes.bannerRectangle}></rect>
                        <circle className={classes.bannerCircle}></circle>
                    </mask>
                    <foreignObject className={classes.bannerForeignObject} mask="url(#circleMask)">
                        <div className={classes.bannerContent}>

                        </div>
                    </foreignObject>
                </svg>
            </header>
            <div className={classes.profilePicture}>
                <img className={classes.profilePicContent} src={profile.profilePic} alt=""/>
            </div>
            <div className={classes.profileBody}>
                <div>
                    <h2 className={classes.displayName}>{profile.displayName}</h2>
                    <span className={classes.username}>{profile.username}</span>
                </div>
                <div className={classes.profileOtherInfoWrapper}>
                    <h4>
                        Member Since
                    </h4>
                    <div className={classes.memberSinceTime}>
                        {renderMemberSince()}
                    </div>
                </div>
            </div>
        </div>
    );
}