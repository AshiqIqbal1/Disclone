import React from "react";
import classes from "./onlinePeople.module.css";
import { Friend } from "../allFriendList/allFriendList";

export default function OnlinePeople({ user, children }: {user: Friend, children: React.ReactNode}) {
    return (
        <div className={classes.profileWrapper}>
            <div className={classes.profileInnerWrapper}>
                <div className={classes.profileInfo}>
                    <div className={classes.profilePic}>
                        <img className={classes.profilePicIcon} src={user.profilePic} alt="" />
                    </div>
                    <div className={classes.profileNameWrapper}>
                        <span className={classes.profileName}>
                            {user.displayName}
                        </span>
                        <div className={classes.profileStatus}>
                            {user.status}
                        </div>
                    </div>
                </div>
                <div className={classes.actions}>
                    {
                        React.Children.toArray(children).map((child, _key) => (
                            child
                        ))
                    }
                </div>
            </div>
        </div>
    );
}