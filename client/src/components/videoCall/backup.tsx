// import classes from "./videoCall.module.css";
// import { useEffect, useRef, useState } from "react";
// import { useSocket } from "../../providers/socketProvider";
// import CallOptionIcon from "../callOptionIcon/callOptionIcon";
// import { faDisplay, faMicrophone, faPhone, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
// import { profileInfo } from "../directMessageRightBar/directMessageRightBar";
// import VoiceCallAnswerModal from "../voiceCallAnswerModal/voiceCallAnswerModal";

// export default function VideoCall(
//     { onCall, profile, video, onClose } :
//     { onCall: boolean, profile: profileInfo, video: boolean, onClose: () => void }
// ) {
//     const localVideoRef = useRef<HTMLVideoElement | null>(null);
//     const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
//     const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
//     const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
//     const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(video); // Default to passed 'video' value
//     const [receivedOffer, setReceivedOffer] = useState<boolean>(false);
//     const [answer, setAnswer] = useState<boolean>(false);

//     const socket = useSocket();
//     if (!socket) return null; // Return null if socket is not available

//     const handleCallAnswer = (answered: boolean) => {
//         setAnswer(answered);
//         setReceivedOffer(false); // Hide the answer modal after answering
//     };

//     useEffect(() => {
//         const setupPeerConnection = async () => {
//             if (peerConnection) {
//                 peerConnection.close();
//             }

//             const pc = new RTCPeerConnection({
//                 iceServers: [
//                     { urls: [
//                             "stun:stun.l.google.com:19302",
//                             "stun:stun1.l.google.com:19302", 
//                         ]
//                     }
//                 ],
//             });

//             setPeerConnection(pc);

//             try {
//                 const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoEnabled, audio: true });
//                 setMediaStream(stream);

//                 if (localVideoRef.current) {
//                     localVideoRef.current.srcObject = stream;
//                 }

//                 stream.getTracks().forEach(track => {
//                     if (pc.signalingState !== "closed") {
//                         pc.addTrack(track, stream);
//                     }
//                 });
//             } catch (error) {
//                 console.error("Error accessing media devices:", error);
//             }

//             pc.ontrack = (event) => {
//                 if (remoteVideoRef.current) {
//                     remoteVideoRef.current.srcObject = event.streams[0];
//                 }
//             };

//             pc.onicecandidate = (event) => {
//                 if (event.candidate) {
//                     socket.emit("ice-candidate", event.candidate);
//                 }
//             };

//             socket.on("offer", async (offer) => {
//                 if (pc.signalingState !== "stable") {
//                     console.warn("Ignoring offer: unexpected signaling state", pc.signalingState);
//                     return;
//                 }
                
//                 await pc.setRemoteDescription(new RTCSessionDescription(offer));

//                 const answer = await pc.createAnswer();
//                 await pc.setLocalDescription(answer);
//                 console.log("accepted Offer", answer);
//                 socket.emit("answer", answer);
//             });

//             socket.on("answer", async (answer) => {
//                 if (!pc || pc.signalingState !== "have-local-offer") {
//                     console.warn("Ignoring answer: unexpected signaling state", pc?.signalingState);
//                     return;
//                 }
//                 await pc.setRemoteDescription(new RTCSessionDescription(answer));
//                 console.log("hearing back from them", answer);
//             });

//             socket.on("ice-candidate", async (candidate) => {
//                 if (!pc.remoteDescription) {
//                     console.warn("ICE candidate received before remote description was set.");
//                     return;
//                 }

//                 try {
//                     console.log("added candidate", candidate);
//                     await pc.addIceCandidate(new RTCIceCandidate(candidate));
//                 } catch (error) {
//                     console.error("Error adding ICE candidate:", error);
//                 }
//             });

//             return () => {
//                 pc.close();
//             };
//         };

//         setupPeerConnection();

//         return () => {
//             if (peerConnection) {
//                 peerConnection.close();
//                 setPeerConnection(null);
//             }
//         };
//     }, [isVideoEnabled]);

//     const startCall = async () => {
//         try {
//             if (!peerConnection) return;
//             const offer = await peerConnection.createOffer();
//             await peerConnection.setLocalDescription(offer);
//             console.log("calling the person (created offer)")
//             socket.emit("offer", offer);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     useEffect(() => {
//         if (onCall) {
//             startCall();
//         }
//     }, [onCall]);

//     const endCall = () => {
//         if (peerConnection) {
//             peerConnection.getSenders().forEach(sender => peerConnection.removeTrack(sender));
//             peerConnection.close();
//             setPeerConnection(null);
//         }

//         if (mediaStream) {
//             mediaStream.getTracks().forEach(track => track.stop());
//             setMediaStream(null);
//         }

//         socket.emit("call-ended");
//         console.log("Call ended");

//         if (localVideoRef.current) localVideoRef.current.srcObject = null;
//         if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//         console.log("Closed");
//         onClose();
//     };

//     const toggleVideo = () => {
//         setIsVideoEnabled(prev => !prev);
//     };

//     if (!onCall) return null;

//     return (
//         <>
//             <VoiceCallAnswerModal open={receivedOffer} onClose={() => setReceivedOffer(false)} />
//             <div className={classes.videoCallWrapper}>
//                 {isVideoEnabled ? (
//                     <div className={classes.videoWrapper}>
//                         <video ref={localVideoRef} className={classes.video} autoPlay playsInline />
//                         <video ref={remoteVideoRef} className={classes.video} autoPlay playsInline />
//                     </div>
//                 ) : (
//                     <div className={classes.voiceCallWrapper}>
//                         <div className={`main-topbar ${classes.videoCallTopBar}`}>
//                             <div className="main-topbar-profile-info">
//                                 <div className={classes.profileIconWrapper}>
//                                     <img className={classes.profileIconTopbar} src={profile.profilePic} alt="" />
//                                 </div>
//                                 <div className="friends-title">{profile.displayName}</div>
//                             </div>
//                         </div>

//                         <div className={classes.callRegionWrapper} />
//                         <div className={classes.profileWrapper}>
//                             <div className={classes.profile}>
//                                 <img className={classes.profileIcon} src={profile.profilePic} alt="" />
//                             </div>
//                         </div>

//                         <div className={classes.callOptionOuterWrapper}>
//                             <div className={classes.callOptionInnerWrapper}>
//                                 <CallOptionIcon icon={faVideoSlash} callback={toggleVideo} />
//                                 <CallOptionIcon icon={faDisplay} callback={() => {}} />
//                                 <CallOptionIcon icon={faMicrophone} callback={startCall} />
//                                 <CallOptionIcon icon={faPhone} callback={endCall} />
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {isVideoEnabled && (
//                 <div className={classes.videoCallIconWrapper}>
//                     <div className={`main-topbar ${classes.videoCallTopBar}`}>
//                         <div className="main-topbar-profile-info">
//                             <div className={classes.profileIconWrapper}>
//                                 <img className={classes.profileIconTopbar} src={profile.profilePic} alt="" />
//                             </div>
//                             <div className="friends-title">{profile.displayName}</div>
//                         </div>
//                     </div>
//                     <div className={classes.callOptionOuterWrapper}>
//                         <div className={classes.callOptionInnerWrapper}>
//                             <CallOptionIcon icon={faVideoSlash} callback={toggleVideo} />
//                             <CallOptionIcon icon={faDisplay} callback={() => {}} />
//                             <CallOptionIcon icon={faMicrophone} callback={startCall} />
//                             <CallOptionIcon icon={faPhone} callback={endCall} />
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };
