// VideoContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [dp, setDp] = useState("");
    const [notification, setNotification] = useState([]);
    
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const response = await fetch("https://onlychats.vercel.app/userinfo", {
                    method: "GET",
                    credentials: "include", // Include credentials such as cookies
                });

                const data = await response.json();
                
                if (response.ok) {
                  setDp(data.userData.dp);
                  setUserId(data.userData._id);
                  setIsLoggedIn(true);
                }

                else{
                  navigate("/login"); // Redirect to login page if not logged in
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        checkLoggedIn();
    }, []);

  return (
    <UserContext.Provider
      value={{
        userId, setUserId,
        isLoggedIn, setIsLoggedIn,
        dp, setDp,
        notification, setNotification,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);