import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classes from "./callOptionIcon.module.css";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faPhone } from "@fortawesome/free-solid-svg-icons";

export default function CallOptionIcon({icon, callback} : {icon: IconDefinition, callback: () => void}) {
    return (
        <div 
            onClick={callback}
            className={`${classes.optionWrapper} ${icon === faPhone ? classes.phoneEnd : ""}`}
        >
            <FontAwesomeIcon className={classes.optionIcon} icon={icon} />    
        </div>
    );
}