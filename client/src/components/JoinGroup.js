import React, { useEffect, useState } from "react";
import { HiUserGroup } from "react-icons/hi";
import { IoCloseSharp } from "react-icons/io5";
import "./JoinGroup.css";
import { useUser } from "../UserContext";

const JoinGroup = ({ setShowJoinRoom }) => {
    const { userId } = useUser();
    const [chatRooms, setChatRooms] = useState([]);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await fetch("http://localhost:8080/getallchatrooms", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId }),
                });

                const data = await response.json();

                if (data.success) {
                    setChatRooms(data.chatrooms);
                } else {
                    console.error("Failed to fetch chat rooms:", data.message);
                }
            } catch (error) {
                console.error("Error fetching chat rooms:", error);
            }
        };

        fetchChatRooms();
    }, [userId]);

    const handleJoinGroup = async (chatroomId) => {
        try {
            const response = await fetch("http://localhost:8080/joinnewchatroom", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, chatroomId }),
            });

            const data = await response.json();

            if (data.success) {
                console.log("Joined chat room successfully");
                // Optionally remove the joined chat room from the list
                setChatRooms(chatRooms.filter(chatRoom => chatRoom._id !== chatroomId));
            } else {
                console.error("Failed to join chat room:", data.message);
            }
        } catch (error) {
            console.error("Error joining chat room:", error);
        }
    };

    return (
        <div className="join-group-main-container">
            <div className="create-new-group-navbar">
                <h2>
                    <span>
                        <HiUserGroup />
                    </span>
                    Available Chat Rooms
                </h2>
                <h1 onClick={() => setShowJoinRoom(false)}>
                    <IoCloseSharp />
                </h1>
            </div>

            <div className="join-group-chat-room-list-main-container">
                {chatRooms.map((chatRoom) => (
                    <div className="join-group-chat-room-main-container" key={chatRoom._id}>
                        <div className="join-group-chat-room-image-and-name-container">
                            <div className="join-group-chat-room-image-container">
                                <img src={chatRoom.groupChatDp || "default_dp.jpg"} alt="dp" className="join-group-chat-room-image" />
                            </div>
                            <div className="join-group-chat-room-group-name-container">
                                <h2>{chatRoom.chatName}</h2>
                                <p className="join-group-bio">{chatRoom.groupChatBio}</p>
                                <p className="members-count">{chatRoom.participants.length} members</p>
                            </div>
                        </div>
                        <div className="join-group-chat-room-group-join-btn-and-members-container">
                            <div className="join-group-chat-room-group-join-btn-container">
                                <button onClick={() => handleJoinGroup(chatRoom._id)}>Join</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JoinGroup;