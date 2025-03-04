import { useState } from "react";
import modalStyles from "../createServerModal/createServerModal.module.css";
import classes from "./CreateServerChannel.module.css";

export default function CreateServerChannel(
    { serverid, open, onClose } : {serverid: string, open: boolean, onClose: () => void}
) {

    const [channelName, setChannelName] = useState("");

    const handleCreateChannel = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (channelName.length === 0) {
            return;
        }
        
        event.preventDefault();
        try {
            const response = await fetch("https://discloned.up.railway.app/createChannel", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("Authorization")
                },
                body: JSON.stringify({ 
                    name: channelName,
                    serverid: serverid
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.message} Status: ${response.status}`);
            }
            
            onClose;
            
        } catch (error) {
            console.error(error);
        }
    };

    if (!open) return null;
    return (
        <>
            <div onClick={onClose} className={modalStyles.overlay}/>
            <div className={classes.modalWrapper}>
                <div className={classes.modalTitle}>
                    <div className={classes.titleName}>
                        Create Channel
                    </div>
                    <div className={classes.modalCaption}>
                        in Text Channels
                    </div>
                </div>
                <div className={classes.modalMainContent}>
                    <div className="auth-input-box reset-margin">
                        <label className={`input-label ${classes.channelName}`}>
                            CHANNEL NAME
                        </label>
                        <input
                            type="text"
                            className="input-box"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            required
                            placeholder="new-channel"
                        />
                    </div>
                </div>
                <div className={modalStyles.btnWrapper}>
                    <button 
                        onClick={onClose}
                        className={`${modalStyles.backBtn}`}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateChannel}
                        className={
                            `${modalStyles.createBtn} 
                            ${classes.createBtn}
                            ${channelName === "" ?
                                (
                                    modalStyles.disableButton
                                ):
                                ""
                            }`
                        }
                    >
                        Create Channel
                    </button>
                </div>
            </div>
        </>
    );
}