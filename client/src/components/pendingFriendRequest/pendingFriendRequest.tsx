import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OnlinePeople from "../onlinePeople/onlinePeople";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useSocket } from "../../providers/socketProvider";
import OnlinePeopleLinks from "../onlinePeopleLinks/onlinePeopleLinks";
import { Types } from "mongoose";
import { Friend } from "../allFriendList/allFriendList";
import FriendSearchBar from "../friendSearchBar/friendSearchBar";

export default function PendingFriendRequest() {
    const socket = useSocket();
    const [sentRequests, setSentRequests] = useState<Friend[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<Friend[]>([]);
    const [searched, setSearched] = useState<Friend[]>([]);

    const handleStoring = (data: Friend[]) => {
        setSentRequests(
            data.filter(
                (friend) => (
                    friend.connectionStatus === "pending" &&
                    friend.requestedBy !== friend.id
                )
            )
        );

        setReceivedRequests(
            data.filter(
                (friend) => (
                    friend.connectionStatus === "pending" &&
                    friend.requestedBy === friend.id
                )
            )
        );
    }

    const handleSearch = (search: string) => {
        const friends = sentRequests.concat(receivedRequests);
        setSearched(friends.filter((friend) => 
            friend.username.toLowerCase().includes(search.toLowerCase())
        ));
    }

    const getFriendRequestList = async () => {
        try {
            const response = await fetch("http://localhost:3000/friendList", {
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

            const output: Friend[] = (await response.json()).friends;
            handleStoring(output);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getFriendRequestList();
    }, []);

    useEffect(() => {
        socket?.on('updateFriendList', (data: Friend[]) => {
            handleStoring(data);
            console.log(data);
        });
    }, [socket]);

    const acceptFriendRequest = async (friendid: Types.ObjectId) => {
        try {
            const response = await fetch("http://localhost:3000/acceptFriendRequest", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("Authorization")
                },
                body: JSON.stringify({ friendid: friendid })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.message} Status: ${response.status}`);
            }

            console.log(await response.json());
            
        } catch (error) {
            console.error(error);
        }
    }

    return (
        (
            sentRequests.length > 0 ||
            receivedRequests.length > 0 ||
            searched.length > 0
        ) ? 
        (
            <div>
                <FriendSearchBar search={() => handleSearch}/>
                {
                    receivedRequests.length > 0 ? 
                    (
                        <div>
                            <h2 className="online-info-title-text">
                                RECEIVED — {receivedRequests.length}
                            </h2>
                            {
                                receivedRequests.map((user, index) => (
                                    <OnlinePeople 
                                        key={index} 
                                        user={user} 
                                    >
                                        <OnlinePeopleLinks 
                                            child={<FontAwesomeIcon icon={faCheck} />}
                                            type="accept"
                                            userid={user.id}
                                            callback={acceptFriendRequest}
                                        />
                                        <OnlinePeopleLinks 
                                            child={<FontAwesomeIcon icon={faXmark} />} 
                                            type="reject" 
                                            userid={user.id}
                                            callback={acceptFriendRequest}
                                        />
                                    </OnlinePeople>
                                ))
                            }
                        </div>
                    ) : ""
                }
                {
                   sentRequests.length > 0 ? 
                    (
                        <div>
                            <h2 className="online-info-title-text">
                                SENT — {sentRequests.length}
                            </h2>
                            {
                                sentRequests.map((user, index) => (
                                    <OnlinePeople 
                                        key={index} 
                                        user={user} 
                                    >
                                        <OnlinePeopleLinks 
                                            child={<FontAwesomeIcon icon={faXmark} />} 
                                            type="reject" 
                                            userid={user.id}
                                            callback={acceptFriendRequest}
                                        />

                                    </OnlinePeople>
                                ))
                            }
                        </div>
                    ) : ""
                }
            </div>
        ) : ""
    );
}