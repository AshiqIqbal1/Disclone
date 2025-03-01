import { useParams } from "react-router-dom";
import classes from "./inviteFriendList.module.css";

export default function InviteFriendList({ friend, serverName }) {
    const { serverid } = useParams();

    const handleSendMessage = async () => {
        try {
            const response = await fetch(`http://localhost:5001/serverInviteFriend`, {
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