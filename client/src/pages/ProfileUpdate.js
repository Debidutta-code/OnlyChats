import React, { useState, useEffect } from 'react';
import './ProfileUpdate.css';
import axios from 'axios'; // Import Axios for making HTTP requests
import { RxCross2 } from "react-icons/rx";
import { useUser } from '../UserContext';

const ProfileUpdate = () => {
    const { userId } = useUser();
    const [userDetails, setUserDetails] = useState({});
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [gender, setGender] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [previewProfilePicture, setPreviewProfilePicture] = useState('');
    const [profilePictureChanged, setProfilePictureChanged] = useState(false); // Flag to track profile picture change
    const [loading, setLoading] = useState(false);

    // Fetch user details from backend
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/getuserprofiledetails/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserDetails(data);
                    setName(data.username);
                    setBio(data.bio || '');
                    setGender(data.gender || ''); // Initialize gender state with userDetails.gender if available
                    setPreviewProfilePicture(data.dp); // Set preview picture from backend
                } else {
                    console.error('Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, [userId]); // Fetch details whenever userId changes

    // Handle file selection for profile picture
    const handleProfilePictureChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            setPreviewProfilePicture(URL.createObjectURL(file));
            setProfilePictureChanged(true); // Flag that profile picture has changed
        }
    };

    // Function to upload profile picture to Cloudinary
    const uploadProfilePicture = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'images_preset'); // Your Cloudinary upload preset

        try {
            const response = await axios.post('https://api.cloudinary.com/v1_1/dukdsugqc/image/upload', formData);
            if (response.status === 200) {
                return response.data.secure_url; // Return the secure URL of the uploaded image
            } else {
                console.error('Failed to upload profile picture');
                return null;
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            return null;
        }
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // Set loading state to true
        let profileImageUrl = userDetails.dp;
        if (profilePictureChanged && profilePictureFile) {
            profileImageUrl = await uploadProfilePicture(profilePictureFile);
        }

        console.log(name);
        console.log(bio);
        console.log(gender);
        console.log(profileImageUrl);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/updateuserprofile/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, bio, gender, profileImageUrl })
            });
            if (response.ok) {
                console.log('Profile updated successfully');
                const data = await response.json();
                console.log(data);
            } else {
                console.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
        setLoading(false); // Reset loading state
    };

    const handleCrossClicked = () => {
        window.history.back();
    }

    return (
        <div className={`profile-update-container dark-theme ${loading ? 'loading-cursor' : ''}`}>
            <div className='profile-update-card'>
                <div className='profile-update-heading-and-cross'>
                    <div className='profile-update-heading'>Update Profile</div>
                    <div className='profile-update-heading profile-cross-cross-icon' onClick={handleCrossClicked}> <RxCross2 /> </div>
                </div>
                <div className='profile-update-content'>
                    <label htmlFor='profilePicture' className='profile-update-avatar'>
                        {previewProfilePicture ? (
                            <img 
                                src={previewProfilePicture} 
                                alt='Profile' 
                                className='profile-update-avatar-img' 
                            />
                        ) : (
                            <div className='profile-update-avatar-placeholder'>
                                <img 
                                    src={userDetails.dp} 
                                    alt='Profile' 
                                    className='profile-update-avatar-img' 
                                />
                            </div>
                        )}
                        <input 
                            type='file' 
                            id='profilePicture' 
                            className='profile-update-file-input' 
                            onChange={handleProfilePictureChange} 
                            accept='image/*' 
                        />
                    </label>
                    <div className='profile-update-details'>
                        <form onSubmit={handleSubmit} className='profile-update-form'>
                            <div className='profile-update-group'>
                                <label htmlFor='name' className='profile-update-label'>Name:</label>
                                <input 
                                    type='text' 
                                    id='name' 
                                    className='profile-update-input' 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className='profile-update-group'>
                                <label htmlFor='bio' className='profile-update-label'>Bio:</label>
                                <textarea 
                                    id='bio' 
                                    className='profile-update-textarea' 
                                    value={bio} 
                                    onChange={(e) => setBio(e.target.value)} 
                                    rows={4} 
                                />
                            </div>
                            <div className='profile-update-group'>
                                <label className='profile-update-label'>Gender:</label>
                                <div className='profile-update-gender'>
                                    <label>
                                        <input 
                                            type='radio' 
                                            name='gender' 
                                            value='male' 
                                            checked={gender === 'male'} 
                                            onChange={() => setGender('male')} 
                                        /> Male
                                    </label>
                                    <label>
                                        <input 
                                            type='radio' 
                                            name='gender' 
                                            value='female' 
                                            checked={gender === 'female'} 
                                            onChange={() => setGender('female')} 
                                        /> Female
                                    </label>
                                    <label>
                                        <input 
                                            type='radio' 
                                            name='gender' 
                                            value='other' 
                                            checked={gender === 'other'} 
                                            onChange={() => setGender('other')} 
                                        /> Other
                                    </label>
                                </div>
                            </div>
                            <button type='submit' className={`profile-update-button ${loading ? 'loading' : ''}`} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                        <div className='profile-update-info'>
                            <div className='profile-update-info-item'>
                                <span>Email:</span>
                                <span>{userDetails.email}</span>
                            </div>
                            <div className='profile-update-info-item'>
                                <span>Date Joined:</span>
                                <span>{new Date(userDetails.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileUpdate;
