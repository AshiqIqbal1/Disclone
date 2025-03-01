import { useEffect, useState } from "react";
import OnlinePeople from "../onlinePeople/onlinePeople";
import { Types } from "mongoose";
import { useSocket } from "../../providers/socketProvider";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OnlinePeopleLinks from "../onlinePeopleLinks/onlinePeopleLinks";
import { useNavigate } from "react-router-dom";
import FriendSearchBar from "../friendSearchBar/friendSearchBar";

export interface Friend {
    id: Types.ObjectId,
    username: string,
    profilePic: string,
    displayName: string,
    status: string,
    connectionStatus: string,
    requestedBy: Types.ObjectId
}

export default function AllFriendList({ filter }: {filter: string}) {
    const socket = useSocket();
    const navigate = useNavigate();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searched, setSearched] = useState<Friend[]>([]);

    const handleFilter = (output:Friend[]) => {
        let onlineFriends = output;

        onlineFriends = output.filter(
            (friend) => friend.connectionStatus === "connected"
        );

        if (filter === "ONLINE") {
            onlineFriends = onlineFriends.filter(
                (friend) => friend.status === "Online" 
                
            );
        } 

        setFriends(onlineFriends);
        setSearched(onlineFriends);
    };

    const getFriendList = async () => {
        try {
            const response = await fetch("http://localhost:5001/friendList", {
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

    const handleSearch = (search: string) => {
        setSearched(friends.filter((friend) => 
            friend.username.toLowerCase().includes(search.toLowerCase())
        ));
    }

    useEffect(() => {
        getFriendList();
    }, [filter]);
    
    useEffect(() => {
        socket?.on('updateFriendList', (data) => {
            handleFilter(data);
        });
    }, [socket]);

    return (
        friends.length > 0 ?
        (
            <div>
                <FriendSearchBar search={handleSearch}/>
                <h2 className="online-info-title-text">
                    {filter} — {friends.length}
                </h2>
                {
                    searched && searched.map((user, key) => (
                        <OnlinePeople 
                            key={key} 
                            user={user} 
                        >
                            <OnlinePeopleLinks 
                                child={<FontAwesomeIcon icon={faComment} />}
                                type=""
                                userid={user.id}
                                callback={() => navigate(`/channels/@me/${user.id}`)}
                            />
                        </OnlinePeople>
                    ))
                }
            </div>
        ) : ""
        
    );
}