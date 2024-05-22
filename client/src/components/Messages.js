import { PiDotsThreeOutlineVerticalDuotone } from "react-icons/pi";
import { BsEmojiLaughing } from "react-icons/bs";
import { IoSendSharp } from "react-icons/io5";
import './Messages.css';
import PC from '../assets/pc_logo.png';
import OF from '../assets/of_logo.png';
import { FaCode } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import Picker from 'emoji-picker-react';
import io from 'socket.io-client';
import {ScaleLoader} from 'react-spinners';
import { useUser } from "../UserContext";

const MessageOptions = ({ handleLeaveMessage, handleDeleteChat }) => (
    <div className="message-options">
        <button onClick={handleLeaveMessage}>Close Chat</button>
        <button onClick={handleDeleteChat}>Delete Chat</button>
    </div>
);

const MessageOptionsMenu = ({ handleLeaveMessage, handleDeleteChat }) => {
    return (
        <div className="message-options-menu">
            <MessageOptions handleLeaveMessage={handleLeaveMessage} handleDeleteChat={handleDeleteChat} />
        </div>
    );
};

const ENDPOINT = "https://onlychats-0acg.onrender.com";
var socket, selectedChatCompare;

const MessagesComponent = ({ setIsProfileClicked, isAnyOnesChatOpen, contactClicked, userId, setContactFullDetails, setIsAnyOnesChatOpen, allMessages, setAllMessages, setChatRoomFullDetails }) => {

    const [message, setMessage] = useState('');
    const [allPrevMessages, setAllPrevMessages] = useState(allMessages);
    const [chatId, setChatId] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const {notification, setNotification} = useUser();
    
    useEffect(() => {
        socket = io(ENDPOINT);

        socket.emit("setup", userId);

        socket.on('connected', () => setSocketConnected(true));  // Corrected event name
        socket.on('typing', () => setIsTyping(true));
        socket.on('stop typing', () => setIsTyping(false));

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
    }, [allMessages]);

    useEffect(() => {
        // Step 3: Focus the input field when the component mounts
        if (inputRef.current) {
          inputRef.current.focus();
        }
    }, [contactClicked]);


    useEffect(() => {
        // Request all the messages from the database
        const fetchAllMessages = async () => {
            try {
                const chatId = contactClicked._id;
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fetchallmessages/${userId}/${chatId}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    setAllMessages(data.messages);
                    socket.emit('join chat', contactClicked._id)
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        }

        if (isAnyOnesChatOpen) {
            if(allPrevMessages === allMessages){
                return;
            }
            // console.log("My ID: ", userId, " will send messages to: ", contactClicked._id);
            // console.log("Opened Chat ID - ", contactClicked._id);
            setChatId(contactClicked._id);
            fetchAllMessages();
            selectedChatCompare = contactClicked;
        }
    }, [isAnyOnesChatOpen, contactClicked]);

    useEffect(() => {
        socket.on('message received', (newMessageReceived) => {
            // console.log("newMessageReceived - ", newMessageReceived);
            if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chatroom._id){
                // give notification
                if(contactClicked && contactClicked._id === newMessageReceived.chatroom._id){
                    return;
                }
                else if(!notification.includes(newMessageReceived)){
                    setNotification([newMessageReceived, ...notification]);
                }
            }
            else{
                setAllMessages([...allMessages, newMessageReceived]);
            }
        } )
    });

    const handleMessageInputChange = (e) => {

        setMessage(e.target.value);
        

        if(!socketConnected) return;

        if(!typing){
            setTyping(true);
            socket.emit('typing', contactClicked._id);
        }

        let lastTypingTime = new Date().getTime();

        var timerLength = 3000;

        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDifference = timeNow - lastTypingTime;

            if(timeDifference >= timerLength && typing){
                socket.emit('stop typing', contactClicked._id);
                setTyping(false);
            }
        }, timerLength)
    }

    const handleMessageSendClicked = async () => {
        socket.emit('stop typing', contactClicked._id);
        if (showEmojiPicker) {
            setShowEmojiPicker((prev) => !prev);
        }

        if (message === "") {
            return;
        }

        else {
            const response = await fetch(`http://localhost:8080/sendmessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    chatId: chatId,
                    message: message
                })
            })

            const data = await response.json();

            if (data.success) {
                // console.log("sendmessage data - - - ",data);
                socket.emit('new message', data.newMessage);

                setAllMessages([...allMessages, data.newMessage]);
            }
            setMessage('');
        }
    }

    const handleGroupProfileButtonClicked = () => {
        setIsProfileClicked((prevState) => prevState ? prevState : !prevState);

        // console.log("cc cc cc", contactClicked);
        setChatRoomFullDetails(contactClicked);
    }


    const handleProfileButtonClicked = async (id) => {
        try {

            const contactId = id;
            const response = await fetch(`http://localhost:8080/gettheprofiledetails/${contactId}`, {
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

    const handleMenuToggle = () => {
        setIsMenuOpen((prevState) => !prevState);
    };

    const handleLeaveMessage = () => {
        setIsAnyOnesChatOpen(false);
    };

    const handleDeleteChat = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/deletechat`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ chatId: contactClicked._id })
            });

            const data = await response.json();

            if (data.success) {
                console.log("Chat deleted successfully");
                setAllMessages([]);
            } else {
                console.error("Failed to delete chat:", data.message);
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    return (
        <div className="homepage-messages-container">
            {!isAnyOnesChatOpen && (
                <div className="homepage-messages-container-main-when-no-ones-chat-open">
                    <div className="homepage-messages-container-when-no-ones-chat-open-image">
                        <img
                            src={PC}
                            className="homepage-messages-when-no-ones-chat-open-image"
                            alt="PC"
                        ></img>
                    </div>
                    <div className="homepage-messages-container-when-no-ones-chat-open-of-logo">
                        <img
                            src={OF}
                            className="homepage-messages-when-no-ones-chat-open-of-logo"
                            alt="OF"
                        ></img>
                        <div><h1><span className="loading-heading1">Only</span><span className="loading-heading3">Chats</span></h1></div>
                    </div>

                    <div><h1 className="designer"><FaCode /> Designed and developed by <a href="https://github.com/debidutta-code" target="_blank" rel="noreferrer" ><FaGithub /> Debidutta Acharya</a> </h1></div>
                </div>
            )}
            {isAnyOnesChatOpen && (

                <div className="homepage-messages-main-heading-container">
                    <div className="homepage-messages-heading-text">
                        <div className="homepage-messages-heading-text-sender-with-pic">
                            {contactClicked.isGroupChat ? (
                                // If it's a group chat, display group chat profile picture and name
                                <>
                                    <div className="homepage-message-heading-profile-image-of-sender-container" onClick={() => handleGroupProfileButtonClicked(contactClicked._id)}>
                                        <img src={contactClicked.groupChatDp} className="homepage-message-heading-profile-image-of-sender" alt="dp" />
                                    </div>
                                    <div className="homepage-message-heading-name-of-sender-container" onClick={() => handleGroupProfileButtonClicked(contactClicked._id)}>
                                        <h1 className="homepage-message-heading-name-of-sender">{contactClicked.chatName}</h1>
                                    </div>
                                </>
                            ) : (
                                // If it's not a group chat, iterate through participants and display profile picture and username
                                <>
                                    {contactClicked.participants.map((participant, index) => (
                                        participant._id !== userId && (
                                            <>
                                                <div className="homepage-message-heading-profile-image-of-sender-container" key={index} onClick={() => handleProfileButtonClicked(participant._id)}>
                                                    <img src={participant.dp} className="homepage-message-heading-profile-image-of-sender" alt="dp" />
                                                </div>
                                                <div className="homepage-message-heading-name-of-sender-container" key={participant._id} onClick={() => handleProfileButtonClicked(participant._id)}>
                                                    <h1 className="homepage-message-heading-name-of-sender">{participant.username}</h1>
                                                    {isTyping && (
                                                        <ScaleLoader
                                                        color="#c8c8c8"
                                                        height={10}
                                                        margin={2}
                                                        radius={21}
                                                        speedMultiplier={2}
                                                        width={5}
                                                      />
                                                    )}
                                                </div>
                                            </>
                                        )
                                    ))}

                                </>
                            )}
                        </div>
                        <div className="homepage-message-heading-three-dot" onClick={handleMenuToggle}>
                            {isMenuOpen ? (
                                <RxCross2 />
                            ) : (
                                <PiDotsThreeOutlineVerticalDuotone />
                            )}
                            {isMenuOpen && <MessageOptionsMenu handleLeaveMessage={handleLeaveMessage} handleDeleteChat={handleDeleteChat} />}
                        </div>
                    </div>


                    {/* main message box component */}
                    {/* message-left-side */}
                    <div className="homepage-message-box-main-content-container">
                        {/* Map over allMessages array */}
                        {allMessages.map((message, index) => (
                            <div key={index} className={`homepage-message-box-single-message-content-container ${message.sender._id === userId ? "homepage-right-side" : "homepage-left-side"}`}>
                                {contactClicked.isGroupChat && message.sender._id !== userId ? (
                                    <div className={`homepage-message-box-left-right-container ${message.sender._id === userId ? "message-right-side" : "message-left-side"}`}>
                                        <div className="homepage-message-sender-dp">
                                            <img src={message.sender.dp} alt="Sender DP" className="homepage-message-sender-dp-image" />
                                        </div>
                                        <div className="homepage-message-sender-info">
                                            <h3>{message.sender.username}</h3>
                                            <div>
                                                <p>{message.content}</p>
                                                <span>{formatDate(message.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`homepage-message-box-left-right-container ${message.sender._id === userId ? "message-right-side" : "message-left-side"}`}>
                                        <h3>
                                            {message.content} <span>{formatDate(message.createdAt)}</span>{" "}
                                        </h3>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>



                    <div className="homepage-message-box-input-text-content-main-container">
                        {showEmojiPicker && (
                            <div className="homepage-message-box-emoji-picker-container">
                                <Picker reactionsDefaultOpen={true} theme="dark" onReactionClick={(e) => {
                                    setMessage((prev) => prev + e.emoji);
                                }} onEmojiClick={(e) => {
                                    setMessage((prev) => prev + e.emoji);
                                }} />
                            </div>
                        )}
                        <div className="homepage-message-box-input-text-content-container">
                            {showEmojiPicker ? (
                                <div className="homepage-message-box-emoji-container" onClick={() => setShowEmojiPicker((prev) => !prev)}>
                                    <RxCross2 />
                                </div>
                            ) : (
                                <div className="homepage-message-box-emoji-container" onClick={() => setShowEmojiPicker((prev) => !prev)}>
                                    <BsEmojiLaughing />
                                </div>
                            )}
                            <div className="homepage-message-box-input-text-container">
                                <input
                                    className="homepage-message-box-input-text"
                                    placeholder="Send a message"
                                    onChange={handleMessageInputChange}
                                    value={message}
                                    onKeyDown={(event) => {
                                        if (event.code === "Enter") {
                                            handleMessageSendClicked();
                                            setMessage("");
                                        }
                                    }}
                                    ref={inputRef}
                                ></input>
                            </div>
                            <div className="homepage-message-box-send-button-container" onClick={handleMessageSendClicked}>
                                <button className="homepage-message-box-send-button">
                                    <IoSendSharp />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MessagesComponent;