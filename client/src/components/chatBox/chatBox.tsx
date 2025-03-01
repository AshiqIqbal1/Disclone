import classes from "./chatBox.module.css"
import SentMessageItem from "../sentMessageItem/sentMessageItem";
import { Message } from "../../pages/directMessage/directMessage";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";

export default function ChatBox({ channel, send, messages } : {channel: string, send: any, messages: Message[]}) {
    const sendMessageInputRef = useRef<HTMLDivElement>(null);
    
    const renderMessage = (message: Message, index: number, array: Message[]) => {
        const prevMessage = array[index - 1];
        const prevDate = prevMessage ? new Date(prevMessage.timeSent) : new Date(0);
        const currDate = new Date(message.timeSent);

        const isDifferentDay = !prevDate || 
            currDate.getFullYear() !== prevDate.getFullYear() ||
            currDate.getMonth() !== prevDate.getMonth() ||
            currDate.getDate() !== prevDate.getDate();
        
        const withHeader = !prevMessage || (currDate.getTime() - prevDate.getTime()) > 5 * 60 * 1000 || prevMessage?.sentBy !== message.sentBy; 
        return (
            <>
                {
                    isDifferentDay ? 
                    <div className={classes.dateSeperator}>
                        <span className={classes.dateSeperatorContent}>
                            {
                                new Date(message.timeSent).toLocaleString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })
                            }
                        </span>
                    </div>
                    : ""
                }
                <SentMessageItem 
                    key={index}
                    name={message.sentByDisplayName}
                    profile={message.sentProfilePic}
                    type={message.contentType} 
                    content={message.content} 
                    timeSent={new Date(message.timeSent).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    })}
                    withHeader={withHeader}
                />
            </>
        );
    };

    const handleEnterPress = (event: { key: string; preventDefault: () => void; }) => {
        if (event.key === "Enter") {
            event.preventDefault();
            send(sendMessageInputRef.current?.innerText);
            sendMessageInputRef.current!.innerText = "";
        }
    };
    
    return (
        <div className={classes.mainContentWrapper}>
            <div className={classes.messagesWrapper}>
                {
                    channel !== "" ?
                        (
                            <div className={classes.welcomeMessageWrapper}>
                                <div className={classes.hastagWrapper}>
                                    <FontAwesomeIcon icon={faHashtag} className={classes.hashtagIcon}/>
                                </div>
                                <h3 className={classes.welcomeTitle}>
                                    Welcome to #{channel}!
                                </h3>
                                <div className={classes.welcomeCaption}>
                                    This is the start of the #{channel} channel.
                                </div>
                            </div>
                        ) : ""
                }
                {
                    messages?.length > 0 ? (
                        messages.map((message, index, array) => 
                            renderMessage(message, index, array)
                        )
                    ) : null
                }
            </div>
            <div className={classes.sendMessageWrapper}>
                <div className={classes.sendMessageInnerWrapper}>
                    <div 
                        ref={sendMessageInputRef}
                        className={classes.sendMessageInput}
                        contentEditable
                        onKeyDown={handleEnterPress}
                    >
                    </div>
                </div>
            </div>
        </div>
    );
}