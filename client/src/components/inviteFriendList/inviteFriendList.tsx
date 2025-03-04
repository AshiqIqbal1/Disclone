import { useParams } from "react-router-dom";
import classes from "./inviteFriendList.module.css";
import { Friend } from "../allFriendList/allFriendList";

export default function InviteFriendList(
    { friend, serverName } : {friend: Friend, serverName: string}
) {
    const { serverid } = useParams();

    const handleSendMessage = async () => {
        try {
            const response = await fetch(`https://discloned.up.railway.app/serverInviteFriend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("Authorization")
                },
                body: JSON.stringify({
                    recipient: friend.id,
                    content: {
                        serverid: serverid,
                        serverName: serverName
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.message} Status: ${response.status}`);
            }

            const output = await response.json();
            console.log(output);
        } catch (error) {
            console.error(error);
        }
    };

    return (
         <div className={classes.invitationFriendWrapper}>
            <div>
                <div>

                </div>
                <div className={classes.inviteFriendText}>
                    {friend.displayName}
                </div>
            </div>
            <button 
                onClick={handleSendMessage}
                className={classes.inviteFriendBtn}>
                Invite
            </button>
        </div>
    );
}