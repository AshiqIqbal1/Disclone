import "./sidebarItemList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useState } from "react";

interface SidebarItem {
    select: () => void
    selected: boolean,
    item: IconProp | string
    callback: any
}

export default function SidebarItemList({ select, selected, item, callback} : SidebarItem) {
    const [hovering, setHovering] = useState(false);

    const renderIcon = () => {
        if (typeof item === "string") {
            return (
                <div className="iconTitle">
                    {item}
                </div>
            );
        } else {
            return ( 
                <FontAwesomeIcon 
                    icon={item}
                    className="discord-messages-icon"
                />
            );
        }
        
    }

    return (
        <div 
            className="sidebar-item"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() => {
                select();
                callback();
            }}
        >
            <div className="sidebar-selected-bar">
                <span 
                    className={`${selected ? "selected-bar" : ""} ${
                        hovering ? "hovering-bar" : ""
                    } bar`}
                />
            </div>
            <div 
                className={`${hovering || selected ? "selected-item" : ""} direct-messages-item`}
            >   
               {
                    renderIcon()
               }
            </div>
        </div>
    );
}