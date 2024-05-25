import './SearchResult.css';
import { useEffect, useState } from 'react';
import { PiGenderFemaleFill, PiGenderMaleFill } from "react-icons/pi";
import { useUser } from '../UserContext'; // Import useUser hook from UserContext
import { IoCloseSharp } from "react-icons/io5";
import { BarLoader } from 'react-spinners';

const SearchResult = ({ setIsSearchFocused, searchedName, setIsNewChatCreated }) => {
    const [usersList, setUsersList] = useState([]);
    const { userId } = useUser(); // Retrieve userId from the UserContext
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/getallusers`);
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsersList(data.users);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };

        fetchAllUsers();
    }, []);

    const handleCardClicked = async (_id) => {
        console.log("Card clicked: ", _id);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/createnewchat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId, // Use the logged-in user's ID
                    participantId: _id
                })
            });

            const data = await response.json();

            if (data.success) {
                // Chatroom created successfully, handle accordingly
                setIsNewChatCreated(prev => prev + 1);
                console.log("Chatroom created: ", data.chatroom);
            } else {
                // Chatroom creation failed, handle accordingly
                console.error("Failed to create chatroom: ", data.message);
            }
        } catch (error) {
            console.error("Error creating chatroom: ", error);
        }

        setIsSearchFocused(false);
    };

    const handleSearchCancelClicked = () => {
        setIsSearchFocused(false);
    };

    // Filter users based on searchedName and exclude current user
    const filteredUsers = usersList.filter(user => user.username.toLowerCase().includes(searchedName.toLowerCase()) && user._id !== userId);
    filteredUsers.sort((a, b) => a.username.localeCompare(b.username));

    return (
        <div className="search-result-main-component">
            <div className='search-result-user-card-list'>
                {filteredUsers.map(user => (
                    <div className='search-result-user-card' key={user._id} onClick={() => handleCardClicked(user._id)}>
                        <div className='search-result-user-profile-component'>
                            <img src={user.dp} alt="Profile" className='search-result-user-profile-pic' />
                        </div>
                        <div className='search-result-user-name-and-bio'>
                            <h1 className='search-result-user-name'>{user.username}</h1>
                            <p className='search-result-user-bio'>
                                {user.bio}
                            </p>
                        </div>
                        <div className='search-result-user-gender-component'>
                            {user.gender === 1 && <PiGenderMaleFill />}
                            {user.gender === 0 && <PiGenderFemaleFill />}
                        </div>
                    </div>
                ))}
            </div>
            {loading && (
                <div className='search-loading-page'>
                    <div className="loader-wrapper">
                        <BarLoader
                            color="#7ad9ff"
                            height={2}
                            width={480}
                        />
                    </div>
                </div>
            )}
            <div className='search-result-cancel-button' onClick={handleSearchCancelClicked}>
                <h1>Cancel </h1> <span><IoCloseSharp /></span>
            </div>
        </div>
    );
};

export default SearchResult;
