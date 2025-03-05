import classes from "./invitePeopleModal.module.css";
import modalStyles from "../createServerModal/createServerModal.module.css";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Friend } from "../allFriendList/allFriendList";
import { useEffect, useState } from "react";
import InviteFriendList from "../inviteFriendList/inviteFriendList";

export default function InvitePeopleModal(
    { open, onCloseInvite, serverName } : 
    {open: boolean, onCloseInvite: () => void, serverName: string}
) {
    if (!open) return null;
    const portalRoot = document.getElementById("portal");
    if (!portalRoot) return null;

    const [friends, setFriends] = useState<Friend[]>([]);
    
    const handleFilter = (output:Friend[]) => {
        const onlineFriends = output.filter(
            (friend) => friend.connectionStatus === "connected"
        );

        setFriends(onlineFriends);
    };

    const getFriendList = async () => {
        try {
            const response = await fetch("https://discloned.up.railway.app/friendList", {
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

            const output:Friend[] = (await response.json()).friends;
            handleFilter(output);
        } catch (error) {
            console.error(error);
        }
    };

     useEffect(() => {
            getFriendList();
        }, []);

    return ReactDOM.createPortal (
        <>  
            <div onClick={onCloseInvite} className={modalStyles.overlay}/>
            <div className={classes.modalWrapper}>
                <div className={classes.modalHeaderWrapper}>
                    <div className={classes.modalTitle}>
                        Invite friends to {serverName}
                    </div>
                    <div className={classes.modalGeneral}>
                        <div className={classes.modalGeneralIcon}></div>
                        <div className={classes.modalGeneralText}>
                            general
                        </div>
                    </div>
                    <div className={classes.searchBarWrapper}>
                        <input 
                            type="text" 
                            placeholder="Search for friends"
                            className={classes.searchBarInput}
                        />
                        <div className={classes.searchBarIconWrapper}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} className={classes.searchBarIcon}/>
                        </div>
                    </div>
                </div>
                <div className={classes.invitationWrapper}>
                {
                    friends.map((friend, key) => <InviteFriendList key={key} friend={friend} serverName={serverName}/>)
                }
                </div>
                <div className={modalStyles.btnWrapper}>
                    <label className={`input-label ${classes.channelName}`}>
                        OR, SEND A SERVER INVITE LINK TO A FRIEND
                    </label>
                </div>
                
            </div>
        </>,
        portalRoot
    );
}