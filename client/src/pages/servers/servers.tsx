import { useParams } from "react-router-dom";
import ChatBox from "../../components/chatBox/chatBox";
import classes from "./servers.module.css"
import { useEffect, useState } from "react";
import { Types } from "mongoose";
import { Message } from "../directMessage/directMessage";
import SecondarySidebarServer from "../../components/secondarySidebarServer/secondarySidebarServer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { useSocket } from "../../providers/socketProvider";

interface TextChannel {
    id: Types.ObjectId,
    name: string,
    messages: Message[]
};

export interface Server {
    _id: Types.ObjectId;
    name: string,
    members: Types.ObjectId[],
    textChannels: TextChannel[],
    selectedChannel: Types.ObjectId
}

export default function Servers() {
    const { serverid, channelid } = useParams();
    const socket = useSocket();

    const [serverInfo, setServerInfo] = useState<Server>({
        _id: new Types.ObjectId,
        name: "",
        members: [],
        textChannels: [],
        selectedChannel: new Types.ObjectId
    })

    const [channel, setChannel] = useState<TextChannel>({
        id: new Types.ObjectId(),
        name: "",
        messages: []
    });

    const getServerInformation = async () => {
        try {
            const response = await fetch(`http://localhost:5001/serverInfo/${serverid}`, {
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
            const output = await response.json();
            setServerInfo(output.server);
        } catch (error) {
            console.error(error);
        }
    };

    const getChannelInformation = async () => {
        try {
            const response = await fetch(`http://localhost:5001/channelInfo/${serverid}/${channelid}`, {
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

            const output:TextChannel = (await response.json()).channel;
            setChannel(output);

            document.title = `Discord | #${channel.name} | ${serverInfo.name}`;
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (content: string) => {
        try {
            const response = await fetch(`http://localhost:5001/channels/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("Authorization")
                },
                body: JSON.stringify({
                    serverid: serverid,
                    channelid: channelid,
                    content: content
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

    useEffect(() => {
        getServerInformation();
    }, []);

    useEffect(() => {
        getChannelInformation();
    }, [channelid]);

    useEffect(() => {
        if (!socket) return;
    
        const handleReceiveMessages = (data: Message) => {
            setChannel((prevChannel) => ({
                ...prevChannel,
                messages: [...prevChannel.messages, data]
            }));
        };
    
        socket.on('receiveChannelMessages', handleReceiveMessages);
    
        return () => {
            socket.off('receiveChannelMessages', handleReceiveMessages);
        };
    }, [socket]);
    
    return (
        <div className={classes.wrapper}>
            <SecondarySidebarServer server={serverInfo}/>
            <main className="main-wrapper">
                <div className="main-topbar">
                    <div className="main-topbar-profile-info">
                        <div className={classes.channelIcon}>
                            <FontAwesomeIcon 
                                icon={faHashtag} 
                                className={`${classes.serverProfileIcon}`}
                            />
                        </div>
                        <div className={classes.serverChannelTitle}>
                            <h1 className="friends-title">
                                {channel.name}
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="content-wrapper">
                    <ChatBox channel={channel.name} send={handleSendMessage} messages={channel.messages} />                 
                </div>
            </main>
        </div>
    );
}