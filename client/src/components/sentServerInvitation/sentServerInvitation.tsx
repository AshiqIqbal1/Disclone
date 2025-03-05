import classes from "./sentServerInvitation.module.css";

export default function SentServerInvitation(
    { caption, content } : { caption: string, content: any }
) {
    const handleJoiningServer = async () => {
        try {
            const response = await fetch(`http://localhost:3000/friendJoinServer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("Authorization")
                },
                body: JSON.stringify({
                    serverid: content.serverid
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.message} Status: ${response.status}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.captionWrapper}>
                <label className="input-label">
                    {caption}
                </label>
            </div>
            <div className={classes.mainContentWrapper}>
                <div className={classes.serverDetails}>
                    <div>
                        <div>
                            {content.serverName}
                        </div>
                        <div>general</div>
                    </div>
                    <div>
                    </div>
                </div>
                <button 
                    onClick={handleJoiningServer}
                    className={classes.joinBtn}
                >
                    Join
                </button>
            </div>
        </div>
    );
}