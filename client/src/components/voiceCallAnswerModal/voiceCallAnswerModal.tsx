import { faPhone, faPhoneVolume } from "@fortawesome/free-solid-svg-icons";
import modalStyles from "../createServerModal/createServerModal.module.css";
import classes from "./voiceCallAnswerModal.module.css";
import CallOptionIcon from "../callOptionIcon/callOptionIcon";
import { profileInfo } from "../directMessageRightBar/directMessageRightBar";

export default function VoiceCallAnswerModal(
    {answer, profile, open, onClose} : {answer: () => void, profile: profileInfo, open: boolean, onClose: () => void}
) {
    if (!open) return null;
    return (
        <>
            <div onClick={onClose} className={modalStyles.overlay}/>
            <div className={classes.modalWrapper}>
                <div className={classes.profilePicWrapper}>
                    <img src={profile.profilePic} alt="" className={classes.profilePic} />
                </div>
                <div className={classes.profileDisplayName}>
                    {profile.displayName}
                </div>
                <div className={classes.callCaption}>
                    Incoming Call...
                </div>
                <div className={classes.btnWrapper}>
                    <CallOptionIcon icon={faPhone} callback={onClose} />
                    <CallOptionIcon icon={faPhoneVolume} callback={answer} />
                </div>

            </div>
        </>
    );
}