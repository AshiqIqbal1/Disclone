import modalStyles from "../createServerModal/createServerModal.module.css";
import classes from "./voiceCallAnswerModal.module.css";

export default function VoiceCallAnswerModal(
    {answer, open, onClose} : {answer: () => void, open: boolean, onClose: () => void}
) {
    if (!open) return null;
    return (
        <>
            <div onClick={onClose} className={modalStyles.overlay}/>
            <div className={classes.modalWrapper}>
                <button onClick={answer}>Answer</button>
            </div>
        </>
    );
}