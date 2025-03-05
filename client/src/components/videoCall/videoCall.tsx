import classes from "./videoCall.module.css";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../providers/socketProvider";
import CallOptionIcon from "../callOptionIcon/callOptionIcon";
import { faDisplay, faMicrophone, faPhone, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import { profileInfo } from "../directMessageRightBar/directMessageRightBar";
// import VoiceCallAnswerModal from "../voiceCallAnswerModal/voiceCallAnswerModal";

export default function VideoCall(
    { onCall, profile, video, onClose } :
    { onCall: boolean, profile: profileInfo, video: boolean, onClose: () => void }
) {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    // const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    // const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    let localStream: MediaStream;
    let remoteStream: MediaStream;
    let didIOffer: boolean = false;

    const peerConfiguration = {
        iceServers: [
            { 
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302", 
                ]
            }
        ],
    }

    const [receivedOffer, setReceivedOffer] = useState(null);
    // const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(video);
    const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(video);

    const socket = useSocket();
    if (!socket) return null;

    const makeCall = async() => {
        await fetchUserMedia();
        
        await createPeerConnection();

        try {
            if (!peerConnectionRef.current) return;

            console.log("Creating offer...");
            const offer = await peerConnectionRef.current.createOffer();
            console.log(offer);
            await peerConnectionRef.current.setLocalDescription(offer);
            didIOffer = true;

            socket.emit("newOffer", offer);
        } catch (error) {
            console.log(error);
        }
    }

    const answerCall = async(offerObject: any) => {
        await fetchUserMedia();
    
        await createPeerConnection(offerObject[0]);

        const answer = await peerConnectionRef.current?.createAnswer({});
        await peerConnectionRef.current?.setLocalDescription(answer);

        offerObject[0].answer = answer 

        const offerIceCandidates = await socket.emitWithAck("newAnswer", offerObject[0]);
        offerIceCandidates.forEach((candidate: RTCIceCandidate) => {
            peerConnectionRef.current?.addIceCandidate(candidate);
            console.log("......Added Ice Candidate.....")
        });

        console.log("offerCandidares:", offerIceCandidates);
    }

    const fetchUserMedia = () => {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    // audio: false 
                });
        
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
        
                localStream = stream;
                resolve(undefined);
            } catch (error) {
                console.error("Error accessing webcam:", error);
                reject(error);
            }
        });        
    }

    const createPeerConnection = (offerObject?: any) => {
        return new Promise(async (resolve, _reject) => {
            const pc = new RTCPeerConnection(peerConfiguration);
            peerConnectionRef.current = pc;

            remoteStream  = new MediaStream();;
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
       
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });

            pc.onsignalingstatechange = (event) => {
                console.log(event);
                console.log(pc.signalingState);
            };

            pc.onicecandidate = (event) => {
                console.log("......ICE Candidate Found!......");
                console.log(event);

                if (event.candidate) {
                    socket.emit("sendIceCandidateToServer", {
                        iceCandidate: event.candidate,
                        didIOffer
                    });
                }
            };

            pc.ontrack = (event) => {
                if (remoteStream) {
                    event.streams[0].getTracks().forEach(track => {
                        remoteStream.addTrack(track);
                    });
                } else {
                    console.error("Remote stream is null, unable to add tracks.");
                }
            };

            if (offerObject) {
                await pc.setRemoteDescription(offerObject.offer);
            }
            
            resolve(undefined);
        });  
    }

    const addAnswer = async (offerObject: any) => {
        if (offerObject.answer) {
            await peerConnectionRef.current?.setRemoteDescription(offerObject.answer);
        } else {
            console.error("Received an invalid answer:", offerObject);
        }
    }

    const addNewIceCandidate = async (iceCandidate: any) => {
        await peerConnectionRef.current?.addIceCandidate(iceCandidate);
        console.log("......Added New Ice Candidate.....")
    }

    const toggleVideo = () => {
        setIsVideoEnabled(prev => !prev);
    };

    useEffect(() => {
        const handleNewOfferAwaiting = (offerObject: any) => {
            setReceivedOffer(offerObject);
            console.log("newOfferAwaiting", offerObject);
        };
    
        const handleAnswerResponse = (offerObject: any) => {
            console.log(offerObject);
            addAnswer(offerObject);
        };
    
        const handleIceCandidate = (iceCandidate: any) => {
            console.log(iceCandidate);
            addNewIceCandidate(iceCandidate);
        };
    
        socket.on("newOfferAwaiting", handleNewOfferAwaiting);
        socket.on("answerResponse", handleAnswerResponse);
        socket.on("receivedIceCandidateFromServer", handleIceCandidate);
    
        return () => {
            socket.off("newOfferAwaiting", handleNewOfferAwaiting);
            socket.off("answerResponse", handleAnswerResponse);
            socket.off("receivedIceCandidateFromServer", handleIceCandidate);
        };
    }, [socket]);
    

    if (!onCall) return null;

    return (
        <>
            {/* <VoiceCallAnswerModal open={receivedOffer} onClose={() => setReceivedOffer(false)} /> */}
            <div className={classes.videoCallWrapper}>
                {isVideoEnabled ? (
                    <div className={classes.videoWrapper}>
                        <video ref={localVideoRef} className={classes.video} autoPlay playsInline />
                        <video ref={remoteVideoRef} className={classes.video} autoPlay playsInline />
                    </div>
                ) : (
                    <div className={classes.voiceCallWrapper}>
                        <div className={`main-topbar ${classes.videoCallTopBar}`}>
                            <div className="main-topbar-profile-info">
                                <div className={classes.profileIconWrapper}>
                                    <img className={classes.profileIconTopbar} src={profile.profilePic} alt="" />
                                </div>
                                <div className="friends-title">{profile.displayName}</div>
                            </div>
                        </div>

                        <div className={classes.callRegionWrapper} />
                        <div className={classes.profileWrapper}>
                            <div className={classes.profile}>
                                <img className={classes.profileIcon} src={profile.profilePic} alt="" />
                            </div>
                        </div>

                        <div className={classes.callOptionOuterWrapper}>
                            <div className={classes.callOptionInnerWrapper}>
                                <CallOptionIcon icon={faVideoSlash} callback={toggleVideo} />
                                <CallOptionIcon icon={faDisplay} callback={() => answerCall(receivedOffer)} />
                                <CallOptionIcon icon={faMicrophone} callback={makeCall} />
                                <CallOptionIcon icon={faPhone} callback={onClose} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isVideoEnabled && (
                <div className={classes.videoCallIconWrapper}>
                    <div className={`main-topbar ${classes.videoCallTopBar}`}>
                        <div className="main-topbar-profile-info">
                            <div className={classes.profileIconWrapper}>
                                <img className={classes.profileIconTopbar} src={profile.profilePic} alt="" />
                            </div>
                            <div className="friends-title">{profile.displayName}</div>
                        </div>
                    </div>
                    <div className={classes.callOptionOuterWrapper}>
                        <div className={classes.callOptionInnerWrapper}>
                            <CallOptionIcon icon={faVideoSlash} callback={toggleVideo} />
                            <CallOptionIcon icon={faDisplay} callback={() => answerCall(receivedOffer)} />
                            <CallOptionIcon icon={faMicrophone} callback={makeCall} />
                            <CallOptionIcon icon={faPhone} callback={onClose} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
