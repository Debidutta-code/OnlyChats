import './Navbar.css';
import OF_LOGO from '../assets/of.png';
import OF from '../assets/of_logo.png';

const Navbar = ({ dp }) => {
    
    const handleLogoutClicked = () => {
        window.location.href = '/login';
    }
    

    return (
        <div className="navbar-main-component">
            <div className='navbar-main-logo-component'>
                <div className='navbar-lock-logo-container'>
                    <img src={OF} className='navbar-of-logo' alt="Logo"></img>
                </div>
                <img src={OF_LOGO} className='navbar-main-logo' alt="Logo"></img>
            </div>
            <div className='navbar-main-search-component'>
            {/* Seeking a chat partner in crime... */}
                <input type='text' className='navbar-main-search-input' placeholder='Seeking a partner to chat with...'></input>
                {/* <button className='navbar-main-search-btn'>Search</button> */}
            </div>
            <div className='navbar-main-profile-component'>
                <button className='navbar-logout-btn' onClick={handleLogoutClicked}>Log out</button>
                {/* Render the profile picture here */}
                {dp && <img src={dp} className='navbar-main-profile-pic' alt="Profile"></img>}
            </div>
        </div>
    )
}

export default Navbar;
