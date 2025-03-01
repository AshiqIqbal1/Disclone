import { useEffect, useState } from "react";
import SecondarySidebarMainList from "../secondarySidebarMainList/secondarySidebarMainList";
import classes from "./secondarySidebar.module.css"
import { faEnvelope, faRocket, faShoppingCart, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { profileInfo } from "../directMessageRightBar/directMessageRightBar";
import UserInfo from "../userInfo/userInfo";

export interface directMessageList {
    id: string,
    profilePic: string,
    displayName: string,
    status: string
};

export default function SecondarySidebar() {
    const [directMessage, setDirectMessage] = useState<directMessageList[]>([]);
    const [profile, setProfile] = useState<profileInfo>({
        username: "",
        displayName: "",
        profilePic: "",
        status: "string",
        timeCreated: new Date
    });

    const getUserInfo = async () => {
        try {
            const response = await fetch("http://localhost:5001/user/info", {
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

    const getDirectMessageList = async () => {
        try {
            const response = await fetch("http://localhost:5001/directMessageList", {
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
            setDirectMessage(output.directMessages);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getDirectMessageList();
        getUserInfo();
    }, []);

    return (
        <div className={classes.secondarySidebarWrapper}>
            <nav className={classes.sidebarItemListWrapper}>
                <div className={classes.searchBar}>
                    <button className={classes.searchBarButton}>Find or start a conversation</button>
                </div>
                <div className={classes.privateChannels}>
                    <ul>
                        <li>
                            <SecondarySidebarMainList iconPic={faUserGroup} key="friends" item="Friends" redirect="/channels/@me"/>
                        </li>
                        <li>
                            <SecondarySidebarMainList iconPic={faEnvelope} key="messageRequests" item="Message Requests" redirect=""/>
                        </li>
                        <li>
                            <SecondarySidebarMainList iconPic={faRocket} key="nitro" item="Nitro" redirect=""/>
                        </li>
                        <li>
                            <SecondarySidebarMainList iconPic={faShoppingCart} key="shop" item="Shop" redirect=""/>
                        </li>
                        <div className={classes.directMessageTitle}>
                            <div className={classes.titleName}>
                                DIRECT MESSAGES
                            </div>
                            <div>
                               
                            </div>
                        </div>
                        <div>
                            {   
                                directMessage.map(
                                    (dm, key) => 
                                    <li>
                                        <SecondarySidebarMainList key={key} iconPic={dm.profilePic} item={dm.displayName} redirect={`/channels/@me/${dm.id}`}/>
                                    </li>
                                )
                            }
                        </div>
                    </ul>
                </div>
            </nav>
            <UserInfo />
        </div>
    );
}