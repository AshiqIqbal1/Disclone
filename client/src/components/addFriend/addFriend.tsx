import { useState } from "react";
import classes from "./addFriend.module.css";

export default function AddFriend() {

    const [username, setUsername] = useState({
        username: ""
    });
    const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        setUsername({
            ...username,
            username: event.target.value,
        });
    }

    const sendFriendRequest = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
            const response = await fetch("http://localhost:5001/friendRequest", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("Authorization")
                },
                body: JSON.stringify(username)
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
            <h2 className={classes.title}>
                ADD FRIEND
            </h2>
            <div className={classes.titleCaption}>
                You can add friends with their Discord username.
            </div>
            <div className={classes.searchBar}>
                <input
                    type="text"
                    value={username.username}
                    onChange={(e) => handleChange(e)}
                    placeholder="You can add friends with their Discord username."
                    className={classes.searchInput}
                    autoFocus
                />
                <button
                    onClick={(e) => sendFriendRequest(e)}
                    className={
                        `${classes.searchButton} 
                        ${username.username === "" ?
                            (
                                classes.disableButton
                            ):
                            ""
                        }`
                    }
                >
                    Send Friend Request
                </button>
            </div>
        </div>
    );
}