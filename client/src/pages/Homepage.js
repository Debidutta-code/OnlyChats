import { useEffect, useState } from "react";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import Navbar from "../components/Navbar";
import MessagesComponent from "../components/Messages";
import ChatsList from "../components/Chats";
import { useUser } from "../UserContext";
import ProfileComponent from "../components/Profile";

const Homepage = () => {
    const [isProfileClicked, setIsProfileClicked] = useState(false);
    const [isAnyOnesChatOpen, setIsAnyOnesChatOpen] = useState(false);
    const [isNewChatCreated, setIsNewChatCreated] = useState(1);
    const [contactClicked, setContactClicked] = useState({});
    const [contactFullDetails, setContactFullDetails] = useState({});
    const [allMessages, setAllMessages] = useState([]);
    const [refreshOnLoad, setRefreshOnLoad] = useState(false);
    const [chatRoomFullDetails, setChatRoomFullDetails] = useState({});

    const { isLoggedIn, dp, userId } = useUser();

    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, [navigate, isLoggedIn]);

    useEffect(() => {
        setIsAnyOnesChatOpen(false);
    }, []);

    if (!isLoggedIn) {
        return <Loading />;
    }

    return (
        <div className="homepage-main-component">
           <Navbar dp={dp ? dp.toString() : ''} setIsNewChatCreated={setIsNewChatCreated} />


            <div className="homepage-main-chat-container">
                <div className="homepage-main-chat-and-message-container">
                    <ChatsList
                        setIsProfileClicked={setIsProfileClicked}
                        setIsAnyOnesChatOpen={setIsAnyOnesChatOpen}
                        isNewChatCreated={isNewChatCreated}
                        setContactClicked={setContactClicked}
                        setContactFullDetails={setContactFullDetails}
                        contactClicked={contactClicked}
                        setAllMessages = {setAllMessages}
                        allMessages = {allMessages}
                        setChatRoomFullDetails = {setChatRoomFullDetails}
                    />
                    <MessagesComponent
                        setIsProfileClicked={setIsProfileClicked}
                        isAnyOnesChatOpen={isAnyOnesChatOpen}
                        userId={userId}
                        contactClicked={contactClicked}
                        setContactFullDetails={setContactFullDetails}
                        setIsAnyOnesChatOpen={setIsAnyOnesChatOpen}
                        allMessages = {allMessages}
                        setAllMessages = {setAllMessages}
                        setChatRoomFullDetails = {setChatRoomFullDetails}
                    />
                </div>
                {isProfileClicked && (
                    <ProfileComponent
                        contactFullDetails={contactFullDetails}
                        chatRoomFullDetails = {chatRoomFullDetails}
                        contactClicked = {contactClicked}
                        setChatRoomFullDetails = {setChatRoomFullDetails}
                        setIsProfileClicked = {setIsProfileClicked}
                    />
                )}
            </div>
        </div>
    );
};

export default Homepage;
