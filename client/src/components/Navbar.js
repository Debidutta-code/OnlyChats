// Navbar.js
import './Navbar.css';
import OF_LOGO from '../assets/of.png';
import OF from '../assets/of_logo.png';
import { useState } from 'react';
import SearchResult from './SearchResult';
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const Navbar = ({ dp, setIsNewChatCreated }) => {
    const [searchedName, setSearchedName] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const navigate = useNavigate();

    const handleLogoutClicked = () => {
        window.location.href = '/login';
    }

    const handleSearchInputChange = (e) => {
        setSearchedName(e.target.value);
    }

    const handleProfileClicked = () => {
        navigate('/profileupdate')
    }

    return (
        <div className="navbar-main-component">
            {isSearchFocused && <SearchResult setIsSearchFocused={setIsSearchFocused} searchedName={searchedName} setIsNewChatCreated={setIsNewChatCreated} />}
            <div className='navbar-main-logo-component'>
                <div className='navbar-lock-logo-container'>
                    <img src={OF} className='navbar-of-logo' alt="Logo"></img>
                </div>
                <img src={OF_LOGO} className='navbar-main-logo' alt="Logo"></img>
            </div>
            <div className='navbar-main-search-component'>
                <input
                    type='text'
                    className='navbar-main-search-input'
                    placeholder='Seeking a partner to chat with...'
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={handleSearchInputChange}
                    value={searchedName}
                />
            </div>
            <div className='navbar-main-profile-component'>
                <button className='navbar-logout-btn' onClick={handleLogoutClicked}> <span>Log out</span>  <IoMdLogOut /> </button>
                <div className='navbar-main-profile-pic-component'>
                    {dp && <img src={dp} className='navbar-main-profile-pic' alt="Profile" onClick={handleProfileClicked}></img>}
                </div>
            </div>
        </div>
    )
}

export default Navbar;
