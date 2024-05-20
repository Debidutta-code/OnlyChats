import { useEffect } from "react"; import { RxCross2 } from "react-icons/rx";


const ProfileComponent = ({ contactFullDetails, chatRoomFullDetails, contactClicked, setChatRoomFullDetails, setIsProfileClicked }) => {
    function formatDate(timestamp) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const date = new Date(timestamp);
        const day = date.getDate();
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${monthName} ${year}`;
    }

    useEffect(() => {
        if (chatRoomFullDetails && chatRoomFullDetails._id !== contactClicked._id) {
            setChatRoomFullDetails({});
        }
    }, [contactClicked]);

    return (
        <div className="homepage-main-profile-container">
            <div className="homepage-profile-container">
                <div className="homepage-profile-heading-container">
                    <div className="homepage-profile-heading-text">
                        <h1>Profile</h1>
                        <div className="profile-cross" onClick={() => {setIsProfileClicked(false)}}><RxCross2 /></div>
                    </div>
                </div>
                <div className="homepage-profile-pic-with-name-component">
                    {chatRoomFullDetails && contactClicked._id === chatRoomFullDetails._id && chatRoomFullDetails.isGroupChat ? (
                        <>
                            <div className="homepage-profile-main-pic-container-group">
                                <img src={chatRoomFullDetails.groupChatDp} alt="profile"></img>
                            </div>
                            <div className="homepage-profile-main-name-container gc-name">
                                <h1>{chatRoomFullDetails.chatName}</h1>
                            </div>
                        </>) : (
                        <>
                            <div className="homepage-profile-main-pic-container">
                                <img src={contactFullDetails.dp} alt="profile"></img>
                            </div>
                            <div className="homepage-profile-main-name-container">
                                <h1>{contactFullDetails.username}</h1>
                            </div>
                        </>
                    )}
                </div>
                <hr className="new5"></hr>
                <div className="homepage-profile-main-bio-container">
                    {chatRoomFullDetails && chatRoomFullDetails.isGroupChat ? (
                        <>
                            <div className="homepage-profile-main-bio-heading-text">
                                <h2>Bio</h2>
                            </div>
                            <div className="homepage-profile-main-bio-text">
                                {chatRoomFullDetails.groupChatBio}
                            </div>
                        </>) : (
                        <>
                            <div className="homepage-profile-main-bio-heading-text">
                                <h2>Bio</h2>
                            </div>
                            <div className="homepage-profile-main-bio-text">
                                {contactFullDetails.bio ? contactFullDetails.bio : "********************************"}
                            </div>
                        </>
                    )}

                </div>
                <hr className="new5"></hr>
                {chatRoomFullDetails && contactClicked._id === chatRoomFullDetails._id && chatRoomFullDetails.isGroupChat ? (
                    <>
                        <div className="homepage-profile-main-participant-list-container">
                            <div className="homepage-profile-main-bio-heading-text">
                                <h2>Members</h2>
                            </div>
                            <div className="homepage-profile-participant-list-container">
                                {chatRoomFullDetails.participants.map((participant, index) => (
                                    <div className="homepage-profile-participant-container" key={index}>
                                        <div className="homepage-profile-participant-pic-container">
                                            <img src={participant.dp} alt="profile" className="profile-pic-image"></img>
                                        </div>
                                        <div className="homepage-profile-participant-name-container">
                                            <h2>{participant.username}</h2>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>) : (<>
                        <div className="homepage-profile-main-other-information-container">
                            <div className="homepage-profile-email-container">
                                <div>
                                </div>
                                <div>
                                    <div className="homepage-profile-email-gender-etc-heading">
                                        Email
                                    </div>
                                    <div className="homepage-profile-email-gender-etc-text">
                                        {contactFullDetails.email}
                                    </div>
                                </div>

                                <div>
                                    <div className="homepage-profile-email-gender-etc-heading">
                                        Date Joined
                                    </div>{" "}
                                    <div className="homepage-profile-email-gender-etc-text">
                                        {formatDate(contactFullDetails.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>)}

            </div>
        </div>
    )
}

export default ProfileComponent;