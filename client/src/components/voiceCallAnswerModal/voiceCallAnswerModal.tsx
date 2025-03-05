import modalStyles from "../createServerModal/createServerModal.module.css";
import classes from "./voiceCallAnswerModal.module.css";

export default function VoiceCallAnswerModal(
    {open, onClose} : {open: boolean, onClose: () => void}
) {
    if (!open) return null;
    return (
        <>
            <div onClick={onClose} className={modalStyles.overlay}/>
            <div className={classes.modalWrapper}>
                <button>Answer</button>
            </div>
        </>
    );
}