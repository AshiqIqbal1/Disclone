import "./sidebar.css";
import SidebarItemList from "../sidebarItemList/sidebarItemList";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { useEffect, useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import CreateServerModal from "../createServerModal/createServerModal";
import { useNavigate } from "react-router-dom";
import { Types } from "mongoose";

interface ServerList {
    _id: Types.ObjectId;
    name: string,
    selectedChannel: Types.ObjectId
}

export const Sidebar = () => {
    const [serverList, setServerList] = useState<ServerList[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState("@me");

    const navigate = useNavigate();

     const getServerList = async () => {
        try {
            const response = await fetch("http://localhost:5001/serverList", {
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

            const output: ServerList[] = (await response.json()).servers;
            console.log(output)
            setServerList(output);
            
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getServerList();
    }, []);

    const checkSelected = (id: string) => {
        return id === selectedItem;
    }

    return (
        <>
            <header className="header">
                <nav className="sidebar">    
                    <SidebarItemList  
                        select={() => setSelectedItem("@me")}
                        selected={checkSelected("@me")} 
                        item={faDiscord} 
                        callback={() => navigate("/channels/@me")}
                    />
                    <div className="sidebar-divider-line"/>
                    {
                        serverList.map(
                            (server, key) => 
                                <SidebarItemList 
                                    select={() => setSelectedItem(server._id.toString())}
                                    selected={checkSelected(server._id.toString())} 
                                    key={key} item={server.name[0]} 
                                    callback={() => navigate(`channels/${server._id}/${server.selectedChannel}`)}
                                />
                        )
                    }
                    <SidebarItemList select={() => null} selected={isOpen} item={faPlus} callback={() => setIsOpen(true)}/>
                </nav>
            </header>
            <CreateServerModal open={isOpen} onClose={() => setIsOpen(false)}/>
        </>
    )
}