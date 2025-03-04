import classes from "./serverTitleDropDown.module.css";

export default function ServerTitleDropDown(
    { open, onClose, activateInvite, activateChannelCreate } :
    { 
        open: boolean, 
        onClose: () => void, 
        activateInvite: () => void, 
        activateChannelCreate: () => void
    }
) {

    const handleInvitation = () => {
        activateInvite();
        onClose();
    };

    const handleChannelCreation = () => {
        activateChannelCreate();
        onClose();
    };

    if (!open) return null;
    return (
        <>
            <div 
                onClick={onClose}
                className={classes.overlay}
            />
            <div className={classes.modalWrapper}>
                <div 
                    onClick={handleInvitation}
                    className={classes.optionWrapper}
                >
                    <div className={classes.optionTitle}>
                        Invite People
                    </div>
                    <div></div>
                </div>
                <div 
                    onClick={handleChannelCreation}
                    className={classes.optionWrapper}
                >
                    <div className={classes.optionTitle}>
                        Create Channel
                    </div>
                    <div></div>
                </div>
            </div>
        </>
    );
}