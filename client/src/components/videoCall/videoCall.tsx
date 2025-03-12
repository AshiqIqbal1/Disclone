import classes from "./videoCall.module.css";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useSocket } from "../../providers/socketProvider";
import CallOptionIcon from "../callOptionIcon/callOptionIcon";
import { faDisplay, faMicrophone, faPhone, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import { profileInfo } from "../directMessageRightBar/directMessageRightBar";
import { useParams } from "react-router-dom";

export const VideoCall = forwardRef((
    { onVoiceCall, profile, receiveCall, onClose }: 
    { onVoiceCall: boolean, profile: profileInfo, receiveCall: (arg0: profileInfo) => void, onClose: () => void },
    ref
) => {
    const socket = useSocket();
    if (!socket) return null;

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const remoteStream = useRef<MediaStream | null>(null);

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

    const isVideoEnabled = useRef<boolean>(false);
    const { recipient } = useParams();

    useImperativeHandle(ref, () => ({
        answer: async (offerObject: any) => {
            isVideoEnabled.current = offerObject[0].offer.sdp.includes("m=video");

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
    
            console.log("offerCandidates:", offerIceCandidates);
        },

        call: async (isVideo: boolean) => {
            
            isVideoEnabled.current = isVideo;

            await fetchUserMedia();
            
            await createPeerConnection();
    
            try {
                if (!peerConnectionRef.current) return;
    
                console.log("Creating offer...");
                const offer = await peerConnectionRef.current.createOffer();
                console.log(offer);
                await peerConnectionRef.current.setLocalDescription(offer);
                didIOffer = true;
                
                socket.emit("newOffer", offer, recipient);
            } catch (error) {   
                console.log(error);
            }
        }
    }));

    const fetchUserMedia = () => {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: isVideoEnabled.current, 
                    audio: true 
                });
        
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
        
                localStream.current = stream;
                // setLocalStream(stream);
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

            remoteStream.current = new MediaStream();;
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream.current;
            }
       
            localStream.current?.getTracks().forEach(track => {
                if (localStream.current) {
                    pc.addTrack(track, localStream.current);
                }
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
                if (remoteStream.current) {
                    event.streams[0].getTracks().forEach(track => {
                        remoteStream.current?.addTrack(track);
                    });
                } else {
                    console.error("Remote stream is null, unable to add tracks.");
                }
            };

            pc.oniceconnectionstatechange = () => {
                if (
                    pc.iceConnectionState === "disconnected" || 
                    pc.iceConnectionState === "failed" || 
                    pc.iceConnectionState === "closed"
                ) {
                    endCall();
                }
            }

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
        isVideoEnabled.current = !isVideoEnabled.current;
    };

    const endCall = async () => {
        console.log("Stopping call...");
        console.log("Local Stream:", localStream);
        console.log("Remote Stream:", remoteStream);

        if (localStream) {
            localStream.current?.getTracks().forEach(track => {
                console.log("Stopping local track:", track);
                track.stop(); 
            });
            localStream.current = null;
            // setLocalStream(null);
        }

        if (localVideoRef?.current) {
            localVideoRef.current.srcObject = null;
        }
    
        if (remoteStream.current) {
            remoteStream.current.getTracks().forEach(track => {
                console.log("Stopping remote track:", track);
                track.stop();
            });
            remoteStream.current = null;
        }

        if (remoteVideoRef?.current) {
            remoteVideoRef.current.srcObject = null;
        }
    
        if (peerConnectionRef?.current) {
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.oniceconnectionstatechange = null;
            peerConnectionRef.current.onsignalingstatechange = null;
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        
        onClose();
    };
    

    useEffect(() => {
        const handleNewOfferAwaiting = (offerObject: any) => {
            console.log("newOfferAwaiting", offerObject);
            receiveCall(offerObject);
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

    if (!onVoiceCall) return null;
    return (
        <>
            <div className={classes.videoCallWrapper}>
                {isVideoEnabled.current ? (
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
                                <CallOptionIcon icon={faDisplay} callback={() => {}} />
                                <CallOptionIcon icon={faMicrophone} callback={() => {}} />
                                <CallOptionIcon icon={faPhone} callback={endCall} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isVideoEnabled.current && (
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
                            <CallOptionIcon icon={faDisplay} callback={() => {}} />
                            <CallOptionIcon icon={faMicrophone} callback={() => {}} />
                            <CallOptionIcon icon={faPhone} callback={endCall} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});
