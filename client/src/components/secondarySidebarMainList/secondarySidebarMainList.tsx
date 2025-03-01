import { useNavigate } from "react-router-dom";
import classes from "./secondarySidebarMainList.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export default function SecondarySidebarMainList({ iconPic, item, redirect } : {iconPic: string | IconDefinition, item: string, redirect: string}) {
    const navigate = useNavigate();

    const renderIcon = () => {
        if (typeof iconPic === "string") {
            return <img className={classes.profileIcon} src={iconPic} alt="" />;
        } else {
            return (
                <div className={classes.profileIcon}>
                    <FontAwesomeIcon className={classes.profileFontIcon} icon={iconPic} />
                </div>
            );
        }
    };

    return (
        <div 
            onClick={() => navigate(redirect)}
            className={classes.sidebarMainList}
        >   
            {
                renderIcon()
            }
            <div>
                { item }
            </div>
        </div>
    );
}