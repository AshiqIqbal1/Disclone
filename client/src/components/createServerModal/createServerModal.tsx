import ReactDOM from "react-dom";
import classes from "./createServerModal.module.css";
import { useState } from "react";

export default function CreateServerModal({ open, onClose }) {
    if (!open) return null
    const portalRoot = document.getElementById("portal");
    if (!portalRoot) return null;

    const [serverName, setServerName] = useState("");

    const handleCreateServer = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
            const response = await fetch("http://localhost:5001/createServer", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("Authorization")
                },
                body: JSON.stringify({ name: serverName })
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

    const handleInput = (e) => {
        let newName = (e.target.value).toLowerCase();
        setServerName(newName);
    }

    return ReactDOM.createPortal (
        <>
            <div onClick={onClose} className={classes.overlay}/>
            <div className={classes.modal}>
                <div className={classes.modalTitleWrapper}>
                    <div className={classes.modalTitle}>
                        Customize Your Server
                    </div>
                    <div className={classes.modalCaption}>
                        Give your new server a personality with 
                        a name and an icon. You can always change it later.
                    </div>
                </div>
                <div className={classes.modalMainContent}>
                    <div className="auth-input-box reset-margin">
                        <label className="input-label">
                            SERVER NAME
                        </label>
                        <input
                            type="text"
                            className="input-box"
                            value={serverName}
                            onChange={handleInput}
                            required
                        />
                    </div>
                    <div className={classes.termsAndCondition}>
                        By creating a server, you agree to Discord's&nbsp;
                        <strong>
                            Community Guidelines
                        </strong>
                        .
                    </div>
                </div>
                <div className={classes.btnWrapper}>
                    <button 
                        onClick={onClose}
                        className={`${classes.backBtn}`}
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleCreateServer}
                        className={
                            `${classes.createBtn} 
                            ${serverName === "" ?
                                (
                                    classes.disableButton
                                ):
                                ""
                            }`
                        }
                    >
                        Create
                    </button>
                </div>
            </div>  
        </>,
        portalRoot
    );
}