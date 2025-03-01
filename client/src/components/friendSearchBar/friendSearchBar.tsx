import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classes from "./friendSearchBar.module.css"

export default function FriendSearchBar({ search } : {search: (arg0: string) => {}}) {
    return (
        <div className={classes.searchBarWrapper}>
            <div className={classes.searchBarInnerWrapper}>
                <input 
                    type="text"
                    onChange={(e) => search(e.target.value)}
                    placeholder="Search"
                    className={classes.searchBarInput}
                />
                <div className={classes.searchIconWrapper}>
                    <FontAwesomeIcon 
                        icon={faMagnifyingGlass} 
                        className={classes.searchIcon}
                    />
                </div>
            </div>
        </div>
    );
}