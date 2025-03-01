import SentServerInvitation from "../sentServerInvitation/sentServerInvitation";
import classes from "./sentMessageItem.module.css"

export default function SentMessageItem({ name, profile, type, content, timeSent, withHeader } : {name: string, profile: string, type: string, content: string, timeSent: string, withHeader: boolean}) {

    return (
        withHeader ? (
            <div className={classes.messageWrapper}> 
                <div>
                    <img className={classes.profilePic} src={profile} alt=""/>
                    <h3 className={classes.profileName}>
                        <span className={classes.messageName}>{name}</span>
                        <span className={classes.messageTimeSent}>{ timeSent }</span>
                    </h3>
                    <div className={classes.messageContent}>
                        { 
                            type === "invitation" ?
                            <SentServerInvitation caption="YOU SENT AN INVITE TO JOIN A SERVER" content={content}/> :
                            content
                        }
                    </div>
                </div>
            </div>
        ) :
        <div className={classes.noHeaderMessageWrapper}>
            <div className={classes.messageContent}>
                { 
                    type === "invitation" ?
                    <SentServerInvitation caption="YOU SENT AN INVITE TO JOIN A SERVER" content={content}/> :
                    content
                }
            </div>
        </div>
    );
}