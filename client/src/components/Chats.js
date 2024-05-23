// Your ChatsList component

import { useEffect, useState } from 'react';
import { useUser } from "../UserContext";
import { BarLoader } from 'react-spinners';
import { MdGroupAdd } from "react-icons/md";
import { HiOutlineRefresh } from "react-icons/hi";
import CreateNewGroup from './CreateNewGroup';
import { HiUserGroup } from "react-icons/hi2";
import JoinGroup from './JoinGroup';
import io from 'socket.io-client';

const ENDPOINT = process.env.REACT_APP_BACKEND_URL;
var socket, selectedChatCompare;



const ChatsList = ({ setIsProfileClicked, setIsAnyOnesChatOpen, isNewChatCreated, contactClicked, setContactClicked, setContactFullDetails, setAllMessages, allMessages, setChatRoomFullDetails }) => {
    const { userId, notification, setNotification } = useUser();
    const [chats, setChats] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [refreshChats, setRefreshChats] = useState(false);
    const [showCreateNewRoom, setShowCreateNewRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        socket = io(ENDPOINT);

        socket.emit("setup", userId);

        socket.on('connected', () => setSocketConnected(true));  // Corrected event name
    }, [userId]);

    // console.log(notification, "-------------------------");

    useEffect(() => {
        socket.on('message received', (newMessageReceived) => {
            // console.log(newMessageReceived);
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chatroom._id) {
                // give notification
                if (!notification.includes(newMessageReceived)) {
                    // console.log(newMessageReceived, ".....................");
                    if(newMessageReceived.chatroom._id === contactClicked._id)return;
                    setNotification([newMessageReceived, ...notification]);
                    // setRefreshChats((prev) => !prev);
                    setAllMessages([...allMessages, ...newMessageReceived])
                    // console.log(allMessages);
                }
            }
            else {
                setAllMessages([...allMessages, ...newMessageReceived]);
            }
        })
    });

    useEffect(() => {
        if (contactClicked && notification) {
            const filteredNotifications = notification.filter(notif => notif.chatroom._id !== contactClicked._id);
            setNotification(filteredNotifications);
        }
    }, [contactClicked]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/getallcontactlist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId })
                });

                const data = await response.json();

                if (data.success) {
                    setChats(data.chatrooms);
                } else {
                    console.error("Failed to fetch contacts:", data.message);
                }
            } catch (error) {
                console.error("Error fetching contacts:", error);
            } finally {
                setLoading(false);
            }
        };
        if (userId) {
            fetchContacts();
        }
    }, [userId, isNewChatCreated, refreshChats, allMessages]);

    const handleProfileButtonClicked = async (contact) => {
        try {
            const contactId = contact._id;
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/gettheprofiledetails/${contactId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (data.success) {
                setContactFullDetails(data.contactDetails);
                // console.log(data.contactDetails);
            }

        } catch (error) {
            console.log(error);
        }
        // console.log("contact clicked - - ", contactClicked);
        setIsProfileClicked((prevState) => prevState ? prevState : !prevState);
        // Toggle isProfileClicked state
    };

    const handleChatClicked = (chat) => {
        // console.log("Clicked contact ID:", contact);
        // console.log(chat);
        setAllMessages([]);
        setContactClicked(chat);
        setIsAnyOnesChatOpen(true);
        selectedChatCompare = contactClicked;
    };

    function formatDate(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (seconds < 60) {
            return `${seconds} seconds ago`;
        } else if (minutes < 60) {
            return `${minutes} minutes ago`;
        } else if (hours < 24) {
            return `${hours} hours ago`;
        } else if (days < 30) {
            return `${days} days ago`;
        } else if (months < 12) {
            return `${months} months ago`;
        } else {
            return `${years} years ago`;
        }
    }

    const handleRefreshChatsClicked = () => {
        setRefreshChats((prev) => !prev);
    }

    const handleGroupProfileIconClicked = () => {
        // console.log(contactClicked);
        setIsProfileClicked((prevState) =>!prevState); // Toggle isProfileClicked state
        setChatRoomFullDetails(contactClicked);
        // setIsProfileClicked((prevState) =>!prevState); // Toggle isProfileClicked state
    }


    return (
        <div className="homepage-chats-container">
            <div className="homepage-chats-main-heading-container">
                <div className="homepage-chats-heading-text">
                    <h1>Chats</h1>
                    <div className='homepage-chats-heading-icon-container'>
                        <h2 onClick={() => { setShowJoinRoom(true) }} className='homepage-create-new-chatroom-container' title='Join Chat Room'> <HiUserGroup /> </h2>
                        <h2 onClick={() => { setShowCreateNewRoom(true) }} title='Create New ChatRoom' className='homepage-create-new-chatroom-container'><MdGroupAdd /></h2>
                        <h2 title='Refresh' className='homepage-refresh-chat-button' onClick={handleRefreshChatsClicked}><HiOutlineRefresh /></h2>
                    </div>
                    {showJoinRoom && (
                        <JoinGroup setShowJoinRoom={setShowJoinRoom} />
                    )}
                    {showCreateNewRoom && (
                        <CreateNewGroup setShowCreateNewRoom={setShowCreateNewRoom} />
                    )}
                </div>
                
                {isLoading && (
                    <div className='homepage-chat-loading-spinner-container'>
                        <BarLoader
                            color="#ee08ff"
                            height={1}
                            speedMultiplier={1}
                            width={350}
                        />
                    </div>
                )}
                <div className="homepage-chats-list-main-container">
                    {chats.map((chat, index) => (
                        <div className={`homepage-chatsingle-main-container ${chat._id === contactClicked._id ? "homepage-contact-clicked-aa" : ""}`} key={chat._id} onClick={() => handleChatClicked(chat)}>
                            {/* Condition to check if it's a group chat */}
                            {chat.isGroupChat ? (
                                // Display group chat profile picture
                                <div className="homepage-chatsingle-profile-pic-container" key={chat._id + 1} onClick={handleGroupProfileIconClicked}>
                                    <img src={chat.groupChatDp} className="homepage-chatsingle-profile-pic" alt="Profile" />
                                </div>
                            ) : (
                                // Iterate through participants and display profile picture if not the current user
                                <div className="homepage-chatsingle-profile-pic-container">
                                    {chat.participants.map((participant, idy) => (
                                        participant._id !== userId && (
                                            <img
                                                key={idy}
                                                src={participant.dp}
                                                className="homepage-chatsingle-profile-pic"
                                                alt="Profile"
                                                onClick={() => handleProfileButtonClicked(participant)}
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                            {/* Add condition for chat name */}
                            {chat.isGroupChat ? (
                                // Display group chat name
                                <div className="homepage-chatsingle-name-container" key={chat.isGroupChat}>
                                    <div className='participant-username-and-notification'>
                                        <h2>{chat.chatName}</h2>
                                        {notification && notification.filter(note => note.chatroom._id === chat._id).length > 0 && (
                                            <spana>
                                                {notification.filter(note => note.chatroom._id === chat._id).length}
                                            </spana>
                                        )}
                                    </div>
                                    {chat.lastMessage ? (
                                        <div>
                                            {notification && notification.filter(note => note.chatroom._id === chat._id).length > 0 ? (
                                                <spanb>
                                                    {notification.filter(note => note.chatroom._id === chat._id).length} New Message{notification.filter(note => note.chatroom._id === chat._id).length > 1 ? 's' : ''}
                                                </spanb>
                                            ) : (
                                                <p className='last-message-content'>{chat.lastMessage.content}</p>
                                            )}
                                            <p>{formatDate(chat.lastMessage.createdAt)}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p>Say Hey👋to this hoe</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Iterate through participants and display username if not the current user
                                <div className="homepage-chatsingle-name-container" key={chat._id}>
                                    {chat.participants.map((participant, idz) => (
                                        participant._id !== userId && (
                                            <>
                                                <div className='participant-username-and-notification'>
                                                    <h2 key={idz}>{participant.username} </h2>
                                                    {notification && notification.filter(note => note.chatroom._id === chat._id).length > 0 && (
                                                        <spana>
                                                            {notification.filter(note => note.chatroom._id === chat._id).length}
                                                        </spana>
                                                    )}
                                                </div>

                                                {chat.lastMessage ? (
                                        <div>
                                            {notification && notification.filter(note => note.chatroom._id === chat._id).length > 0 ? (
                                                <spanb>
                                                    {notification.filter(note => note.chatroom._id === chat._id).length} New Message{notification.filter(note => note.chatroom._id === chat._id).length > 1 ? 's' : ''}
                                                </spanb>
                                            ) : (
                                                <p className='last-message-content'>{chat.lastMessage.content}</p>
                                            )}
                                            <p>{formatDate(chat.lastMessage.createdAt)}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p>Say Hey👋to this hoe</p>
                                        </div>
                                    )}
                                            </>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default ChatsList;
