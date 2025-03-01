
import { Types } from "mongoose";
import classes from "./onlinePeopleLinks.module.css";

export default function OnlinePeopleLinks({ 
    child, 
    type, 
    userid, 
    callback 
}: { 
    child: React.ReactNode, 
    type: string, 
    userid: Types.ObjectId, 
    callback: (userid: Types.ObjectId) => void 
}) {  
    return (
        <div 
            className={`${classes.actionLinks} ${classes[type]}`}
            onClick={() => callback(userid)}
        >
            { child }
        </div>
    );
}