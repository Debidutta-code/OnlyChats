import React, { useState } from 'react';
import './Login.css';
import background from "../assets/of_wall_paper2.png";
import Logo from '../assets/of_logo.png';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
  };

  return (
    <div className="login-main-container">
      <div className="login-wallpaper-container">
        <div className="login-content">
          <img src={Logo} className="login-logo" alt="Logo" />
          <h1 className="login-heading">
            <span className="login-heading1">Only</span>
            <span className="login-heading2">Chats</span>{" "}
          </h1>
        </div>
        <div className="login-signupto-text">
            <h1>Sign up to start conversation</h1>
            <h1>with your friends and family</h1>
        </div>
        <img src={background} className="login-of-background" alt="Background"></img>
      </div>

      {/* Login form */}
      <div className="login-form-white-wallpaper-container">
        <div className="login-main-form-container">
            <h1>Login</h1>
          <form className='login-form'>
            <div className="login-form-group login-form-group-email">
              <input type="email" id="email" name="email" placeholder="Email" required />
            </div>
            <div className="login-form-group login-form-group-passwrod">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Password"
                required
              />
              <span className="toggle-password" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button type="submit" className='login-submit'>Login</button>
          </form>
            <div className="login-google-button-container">
                <button className="google-login-button">Login with Google</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
