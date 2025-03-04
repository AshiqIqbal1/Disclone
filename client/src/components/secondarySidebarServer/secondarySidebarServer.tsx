import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Server } from '../../pages/servers/servers';
import stylesA from '../secondarySidebar/secondarySidebar.module.css';
import classes from "./secondarySidebarServer.module.css";
import { faCalendarDay, faChevronDown, faHashtag, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import CreateServerChannel from '../createServerChannel/createServerChannel';
import { useState } from 'react';
import ServerTitleDropDown from '../serverTitleDropDown/serverTitleDropDown';
import InvitePeopleModal from '../invitePeopleModal/invitePeopleModal';
import UserInfo from '../userInfo/userInfo';

export default function SecondarySidebarServer({ server } : {server: Server}) {
    const navigate = useNavigate();
    const [isOpenCreateChannel, setIsOpenCreateChannel] = useState(false);
    const [isOpenInvite, setIsOpenInvite] = useState(false);
    const [serverTitleDropDownIsOpen, setServerTitleDropDownIsOpen] = useState(false);

    return (
        <>
            <div className={stylesA.secondarySidebarWrapper}>
                <nav className={classes.sidebarItemListWrapper}>
                    <div 
                        onClick={() => setServerTitleDropDownIsOpen(true)}
                        className={`${stylesA.searchBar} ${classes.titleWrapper}`}
                    >
                        <div className={classes.titleText}>
                            {server.name}
                        </div>
                        <div>
                            <FontAwesomeIcon icon={faChevronDown} className={classes.chevronIcon}/>
                        </div>
                    </div>
                    <div className={classes.allChannelWrapper}>
                        <div 
                            onClick={() => navigate(``)}
                            className={classes.channelWrapper}
                        >
                            <div className={classes.channelInnerWrapper}>
                                <div>
                                    <FontAwesomeIcon className={classes.channelIcon} icon={faCalendarDay}/>
                                </div>
                                <div className={classes.channelName}>
                                    Events
                                </div>
                            </div>
                        </div>

                        <div className={classes.channelWrapperDivider} />

                        <div className={stylesA.directMessageTitle}>
                            <div></div>
                            <div className={stylesA.titleName}>
                                TEXT CHANNELS
                            </div>
                            <FontAwesomeIcon 
                                icon={faPlus} 
                                className={stylesA.titlePlus}
                                onClick={() => setIsOpenCreateChannel(true)}
                            />
                        </div>
                        {
                            server.textChannels.length ? 
                            (
                                server.textChannels.map((channel, key) => {
                                    return (
                                        <div 
                                            key={key}
                                            onClick={() => {
                                                server.selectedChannel = channel.id;
                                                navigate(`/channels/${server._id}/${channel.id}`);
                                            }}
                                            className={classes.channelWrapper}
                                        >
                                            <div className={`${classes.channelInnerWrapper}   
                                                ${
                                                server.selectedChannel === channel.id ?
                                                    classes.selectedChannel
                                                :
                                                ""
                                                }`}
                                            >
                                                <div>
                                                    <FontAwesomeIcon className={classes.channelIcon} icon={faHashtag}/>
                                                </div>
                                                <div className={classes.channelName}>
                                                    {channel.name}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : "" 
                        }
                    </div>
                    <div>
                        <div className={stylesA.directMessageTitle}>
                            <div></div>
                            <div>
                                VOICE CHANNELS
                            </div>
                            <div>
                                
                            </div>
                        </div>
                    </div>
                </nav>
                <UserInfo />
            </div>
            <CreateServerChannel serverid={server._id.toString()} open={isOpenCreateChannel} onClose={() => setIsOpenCreateChannel(false)}/>
            <ServerTitleDropDown 
                open={serverTitleDropDownIsOpen} 
                onClose={() => setServerTitleDropDownIsOpen(false)}
                activateInvite={() => setIsOpenInvite(true)}
                activateChannelCreate={() => setIsOpenCreateChannel(true)}
            />
            <InvitePeopleModal open={isOpenInvite} onCloseInvite={() => setIsOpenInvite(false)} serverName={server.name}/>
        </>
    );
}