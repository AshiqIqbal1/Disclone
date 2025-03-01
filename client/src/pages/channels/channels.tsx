import "../../assets/css/pages/channels.css";
import SecondarySidebar from "../../components/secondarySidebar/secondarySidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import AddFriend from "../../components/addFriend/addFriend";
import PendingFriendRequest from "../../components/pendingFriendRequest/pendingFriendRequest";
import AllFriendList from "../../components/allFriendList/allFriendList";

export default function Channels() {
    document.title = "Discord | Friends"
    const [selected, setSelected] = useState("ONLINE");

    const renderMainContent = () => {
        switch (selected) {
            case "ALL FRIENDS":
                return <AllFriendList filter="ALL FRIENDS" />
            case "ONLINE":
                return <AllFriendList filter="ONLINE" />
            case "ADD FRIENDS":
                return <AddFriend />
            case "PENDING":
                return <PendingFriendRequest />
        }
    }

    return (
        <div className="flex-wrapper">
            <SecondarySidebar />
            <main className="main-wrapper">
                <div className="main-topbar">
                    <div className="main-topbar-profile-info">
                        <div>
                            <FontAwesomeIcon 
                                icon={faUserGroup} 
                                className="friends-icon"
                            />
                        </div>
                        <div className="friends-title">
                            Friends
                        </div>
                        <div className="friends-divider">

                        </div>
                        <div 
                            className="topbar-field"
                            onClick={() => setSelected("ONLINE")}
                        >
                            Online
                        </div>
                        <div 
                            className="topbar-field"
                            onClick={() => setSelected("ALL FRIENDS")}
                        >
                            All
                        </div>
                        <div 
                            className="topbar-field"
                            onClick={() => setSelected("PENDING")}
                        >
                            Pending
                        </div>
                        <div className="topbar-field">
                            Blocked
                        </div>
                        <div 
                            className="topbar-field add-friend"
                            onClick={() => setSelected("ADD FRIENDS")}
                        >
                            Add Friend
                        </div>
                    </div>
                </div>
                <div className="content-wrapper">
                    <div className="main-content">
                        {renderMainContent()}
                    </div>
                    <div className="right-sidebarWrapper">
                        <h2 className="right-sidebar-title">
                            Active Now
                        </h2>
                        <div className="right-sidebar-caption-wrapper">
                            <div className="right-sidebar-upper-caption">
                                It's quiet for now...
                            </div>
                            <div className="right-sidebar-lower-caption">
                                When a friend starts an activity—like playing a 
                                game or hanging out on voice—we’ll show it here!
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}