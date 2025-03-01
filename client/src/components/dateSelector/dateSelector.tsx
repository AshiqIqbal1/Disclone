import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import "./dateSelector.css"
import { useState } from "react";

type DateSelectorProps = {
    placeholder: string;
    active: boolean;
    options: String[]
};

export default function DateSelector({ placeholder, active, options }: DateSelectorProps) {
    const [selected, setSelected] = useState(placeholder);
    
    return (
        <div 
            className="date-selector-wrapper"
        >  
            <div className="date-selector-input">
                <input 
                    type="text" 
                    className="input-box-date"
                    value={selected}
                    placeholder={placeholder}
                />
                <div className="icon-chevron-container">
                    <FontAwesomeIcon 
                        icon={faChevronDown} 
                        className="icon-chevron-down-month"
                    />
                </div>
            </div>
            {
                active ? 
                (
                    <div className="date-selector-options-container">
                        {
                            options.map(
                                (option) => (
                                    <div 
                                        onClick={() => setSelected(option.toString())}
                                        className={selected === option.toString() ? "selected-option selector-options" : " selector-options"}
                                    >
                                        {option}
                                    </div>
                                )
                            )
                        }
                    </div>
                ):
                ""
            }
        </div>
    );
}