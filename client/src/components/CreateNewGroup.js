import React, { useEffect, useState } from "react";
import "./CreateNewGroup.css"; // Import the CSS file
import { IoCloseSharp } from "react-icons/io5";
import { HiUserGroup } from "react-icons/hi2";
import DANI from "../assets/group.jpg";
import { RxCross2 } from "react-icons/rx";
import { IoImage } from "react-icons/io5";
import axios from "axios";
import { useUser } from "../UserContext";

const CreateNewGroup = ({ setShowCreateNewRoom }) => {
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(DANI);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // Add search query state
    const [chatRoomName, setChatRoomName] = useState("");
    const [chatRoomBio, setChatRoomBio] = useState("");
    const [loading, setLoading] = useState(false); // Add loading state

    const { userId } = useUser();

    useEffect(() => { });

    const uploadFile = async (type) => {
        let fileToUpload = profileImage;

        // If no profile image is selected, fetch the default image as a blob
        if (!fileToUpload) {
            const response = await fetch(DANI);
            const blob = await response.blob();
            fileToUpload = new File([blob], "default.jpg", { type: blob.type });
        }

        const data = new FormData();
        data.append("file", fileToUpload);
        data.append("upload_preset", "images_preset");

        try {
            let resourceType = type === "image" ? "image" : "video";
            let api = `https://api.cloudinary.com/v1_1/dukdsugqc/${resourceType}/upload`;

            setLoading(true);

            const res = await axios.post(api, data);
            const { secure_url } = res.data;

            setLoading(false);

            return secure_url;
        } catch (error) {
            setLoading(false);
            console.error(error);
            return null;
        }
    };

    const handleChatRoomBioChange = (e) => {
        setChatRoomBio(e.target.value);
    };
    const handleChatRoomNameChange = (e) => {
        setChatRoomName(e.target.value);
    };

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/getallusers`);
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                const data = await response.json();
                setAllUsers(data.users); // Assuming the API response has a structure like { users: [] }
            } catch (error) {
                console.log(error);
            }
        };
        fetchAllUsers();
    }, []); // Empty dependency array to fetch users only once on component mount

    // Function to handle file selection and preview
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        console.log("file", file);
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                console.log(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            console.log("hello");
            setProfileImage(null); // Reset to null image
            setPreviewImage(DANI); // Reset to default image
        }
    };

    // Function to trigger file input when clicking on profile image container
    const handleClickProfileImage = () => {
        document.getElementById("profileImageInput").click();
    };

    const addUserToGroup = (user) => {
        setSelectedUsers([...selectedUsers, user]);
    };

    // Function to remove a user from the selected users list
    const removeUserFromGroup = (userId) => {
        const updatedUsers = selectedUsers.filter((user) => user._id !== userId);
        setSelectedUsers(updatedUsers);
    };

    // Filter allUsers to exclude those already in selectedUsers and match search query
    const filteredUsers = allUsers.filter(
        (user) =>
            !selectedUsers.find((selUser) => selUser._id === user._id) &&
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateGroupClicked = async () => {
        if (selectedUsers.length === 0) {
            alert("Must select some users");
            return;
        }
        if (chatRoomName === "") {
            alert("Chat Room Must Have a Name");
            return;
        }

        const avatarimgUrl = await uploadFile("image");

        const groupChatDetails = {
            chatRoomName,
            chatRoomBio,
            avatarimgUrl,
            selectedUsers: selectedUsers.map((user) => user._id),
            admin: userId, // Include the admin as userId
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/createnewgroupchat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(groupChatDetails),
            });

            const data = await response.json();

            if (data.success) {
                console.log("Group chat created successfully");
            } else {
                console.error("Failed to create group chat:", data.message);
            }
        } catch (error) {
            console.error("Error creating group chat:", error);
        }
    };

    return (
        <div className="create-new-group-main-content-container">
            <div className="create-new-group-navbar">
                <h2>
                    <span>
                        <HiUserGroup />
                    </span>
                    New Chat Room
                </h2>
                <h1 onClick={() => setShowCreateNewRoom(false)}>
                    <IoCloseSharp />
                </h1>
            </div>

            <div className="create-new-group-main-container">
                <div className="create-new-group-profile-bio-name-container">
                    <div
                        className="profile-image-container"
                        onClick={handleClickProfileImage}
                    >
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" className="profile-image" />
                        ) : (
                            <div className="empty-profile-image">Choose DP</div>
                        )}
                        <input
                            type="file"
                            id="profileImageInput"
                            name="profileImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }} // Hide the input visually
                        />
                    </div>
                    <p>
                        <span>
                            <IoImage />
                        </span>
                        Choose Group Avatar
                    </p>
                    <input
                        type="text"
                        id="name"
                        name="chatRoomName"
                        placeholder="Chatroom Name"
                        className="chatroom-name-input"
                        required
                        onChange={handleChatRoomNameChange}
                        value={chatRoomName}
                    />
                    <textarea
                        id="bio"
                        name="bio"
                        placeholder="About Group"
                        className="chatroom-bio-input"
                        onChange={handleChatRoomBioChange}
                        value={chatRoomBio}
                    />
                </div>
                <div className="create-new-group-search-add-user-container">
                    <div className="new-group-search-add-submit-button-container">
                        <div className="new-group-added-user-container">
                            <div className="added-user-heading">Added Users</div>
                            <div className="new-group-added-user-list-container">
                                {selectedUsers.map((user) => (
                                    <div key={user._id} className="new-group-selected-user">
                                        <span>{user.username}</span>
                                        <button
                                            className="remove-user-button"
                                            onClick={() => removeUserFromGroup(user._id)}
                                        >
                                            <RxCross2 />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="new-group-search-user-and-filtered-user-container">
                            <div className="new-group-search-user-input-field-container">
                                <input
                                    type="text"
                                    placeholder="Search user"
                                    value={searchQuery} // Bind searchQuery state to the input field
                                    onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state on input change
                                />
                                <div className="new-group-all-filtered-users-list-container">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            className="new-group-user"
                                            onClick={() => addUserToGroup(user)}
                                        >
                                            <div className="new-group-user-image-container">
                                                <img
                                                    src={user.dp}
                                                    alt={user.username}
                                                    className="new-group-user-avatar"
                                                />
                                            </div>
                                            <div className="new-group-user-username-container">
                                                {user.username}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="create-new-group-button-main-container">
                        <button onClick={handleCreateGroupClicked} disabled={loading}>
                            {loading ? "Creating..." : "Create Chat-Room"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNewGroup;
