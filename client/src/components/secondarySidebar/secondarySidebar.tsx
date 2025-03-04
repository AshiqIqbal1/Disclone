import { useEffect, useState } from "react";
import SecondarySidebarMainList from "../secondarySidebarMainList/secondarySidebarMainList";
import classes from "./secondarySidebar.module.css"
import { faEnvelope, faRocket, faShoppingCart, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import UserInfo from "../userInfo/userInfo";

export interface directMessageList {
    id: string,
    profilePic: string,
    displayName: string,
    status: string
};

export default function SecondarySidebar() {
    const [directMessage, setDirectMessage] = useState<directMessageList[]>([]);

    const getDirectMessageList = async () => {
        try {
            const response = await fetch("https://discloned.up.railway.app/directMessageList", {
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