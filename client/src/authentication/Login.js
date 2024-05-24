import React, { useState, useEffect } from "react";
import "./Login.css";
import background from "../assets/of_wall_paper2.png";
import Logo from "../assets/of_logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"// Corrected import statement

const Login = () => {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState('');
  const [dp, setDp] = useState('');
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);

  const navigate = useNavigate();

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    console.log("hello world dev");
    e.preventDefault();
    if (email === "" || password === "") return;
    console.log(email, password);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Include cookies
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle login response
        console.log("data ->", data);
        if (data.success) {
          navigate("/");
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleGoogleSignIn = () => {
    if (email && password && isGoogleSignIn) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, dp }),
        credentials: "include", // Include cookies
      })
        .then((response) => response.json())
        .then((data) => {
          // Handle login response
          console.log("data ->", data);
          if (data.success) {
            navigate("/");
          } else {
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  useEffect(() => {
    handleGoogleSignIn();
  }, [email, password, handleGoogleSignIn]);

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
          <h1>
            <b> Sign in </b> to start conversation
          </h1>
          <h1>with your friends and family</h1>
        </div>
        <img
          src={background}
          className="login-of-background"
          alt="Background"
        ></img>
      </div>

      {/* Login form */}
      <div className="login-form-white-wallpaper-container">
        <div className="login-main-form-container">
          <h1>Login</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group login-form-group-email">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                required
                onChange={handleEmailChange}
                className="login-form-email-input"
              />
            </div>
            <div className="login-form-group login-form-group-passwrod">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Password"
                required
                onChange={handlePasswordChange}
              />
              <span
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            <button type="submit" className="login-submit">
              Login
            </button>
          </form>
          <div>
            {" "}
            don't have account <Link to="/register">Register</Link>{" "}
          </div>
          <div className="login-google-button-container">
            <div className="google-login-button-1">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const credentialResponseDecoded = jwtDecode(
                    credentialResponse.credential
                  );
                  console.log("Login Cred - ", credentialResponseDecoded);
                  setEmail(credentialResponseDecoded.email);
                  setPassword(credentialResponseDecoded.picture);
                  setName(credentialResponseDecoded.name);
                  setDp(credentialResponseDecoded.picture);
                  setIsGoogleSignIn(true);
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
