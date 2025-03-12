import SecondarySidebar from "../../components/secondarySidebar/secondarySidebar";
import classes from "./directMessage.module.css";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Types } from "mongoose";
import { useSocket } from "../../providers/socketProvider";
import DirectMessageRightBar, { profileInfo } from "../../components/directMessageRightBar/directMessageRightBar";
import ChatBox from "../../components/chatBox/chatBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneVolume, faVideo } from "@fortawesome/free-solid-svg-icons";
import { VideoCall } from "../../components/videoCall/videoCall";
import VoiceCallAnswerModal from "../../components/voiceCallAnswerModal/voiceCallAnswerModal";

export interface Message {
    sentBy: Types.ObjectId,
    sentByDisplayName: string,
    sentProfilePic: string,
    contentType: string,
    content: string,
    timeSent: Date 
};

export default function DirectMessage() {
    const socket = useSocket();
    const { recipient } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [profile, setProfile] = useState<profileInfo>({
        username: "",
        displayName: "",
        profilePic: "",
        status: "",
        timeCreated: new Date 
    });

    const [onVoiceCall, setOnVoiceCall] = useState(false);
    const [receivedOffer, setReceivedOffer] = useState(null);
    const videoCallAnswerRef = useRef<{ answer: (arg0: any) => void, call: (arg0: boolean) => void }>(null);
    const [answerModal, setAnswerModal] = useState(false);

    const getProfile = (data: profileInfo) => {
        setProfile(data);
        document.title = `Discord | @${data.displayName}`
    }

    const receiveCall = (data: any) => {
        console.log("call received");
        setReceivedOffer(data);
        setAnswerModal(true);
    }

    const getDirectMessages = async () => {
        try {
            const response = await fetch(`https://discloned.up.railway.app/directMessage/${recipient}`, {
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
            console.log(output)
            setMessages(output.directMessages);
            
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (content: string) => {
        try {
            const response = await fetch(`https://discloned.up.railway.app/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem("Authorization")
                },
                body: JSON.stringify({
                    recipient: recipient,
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
        getDirectMessages();
    }, [recipient]);

    useEffect(() => {
        socket?.on('receiveMessages', (data) => {
            setMessages((prev) => [...prev, data]);
            console.log(data);
        });
    }, [socket]);

    return (
        <div className={classes.wrapper}>
            <SecondarySidebar />
            <VoiceCallAnswerModal 
                answer={() => {
                    videoCallAnswerRef.current?.answer(receivedOffer);
                    setOnVoiceCall(true);
                    setAnswerModal(false);
                }}
                profile={profile}
                open={answerModal} 
                onClose={() => setAnswerModal(false)} 
            />
            <main className="main-wrapper">
                {
                    <VideoCall 
                        ref={videoCallAnswerRef}
                        onVoiceCall={onVoiceCall}
                        profile={profile}
                        receiveCall={receiveCall}
                        onClose={() => {
                            setOnVoiceCall(false);
                        }}
                    />
                    
                }
                <div className="main-topbar">
                    <div className="main-topbar-profile-info">
                        <div className={classes.profileIconWrapper}>
                            <img className={classes.profileIcon} src={profile.profilePic} alt="" />
                        </div>
                        <div className="friends-title">
                            {profile.displayName}
                        </div>
                    </div>
                    <div className="main-topbar-profile-info">

                        {
                            !onVoiceCall ?
                            (
                                <>
                                    <div 
                                        onClick={() => {
                                            setOnVoiceCall(true);
                                            videoCallAnswerRef.current?.call(true)
                                        }}
                                        className="main-topbar-icon-wrapper"
                                    >
                                        <FontAwesomeIcon 
                                            className="main-topbar-icon" 
                                            icon={faVideo}
                                            size="xl"
                                        />
                                    </div>
                                    <div 
                                        onClick={() => {
                                            setOnVoiceCall(true);
                                            videoCallAnswerRef.current?.call(false)
                                        }}
                                        className="main-topbar-icon-wrapper"
                                    >
                                        <FontAwesomeIcon 
                                            className="main-topbar-icon" 
                                            icon={faPhoneVolume}
                                        />
                                    </div>
                                </>
                            )
                            : ""
                        }
                    </div>
                </div>
                <div className="content-wrapper">
                    <ChatBox channel="" send={handleSendMessage} messages={messages}/>
                    {
                        onVoiceCall ? (
                            ""
                        ) : 
                        <div className={classes.rightBar}>
                            <DirectMessageRightBar getProfile={getProfile}/>
                        </div>
                    }
                </div>
            </main>
        </div>
    );
}