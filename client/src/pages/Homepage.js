import { useEffect, useState } from "react";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
  
    useEffect(() => {
        // Check if user is already logged in
        fetch("http://localhost:8080/userinfo", {
            method: "GET",
            credentials: "include", // Include credentials such as cookies
        })
        .then((response) => {
            if (response.ok) {
                setIsLoggedIn(true);
            } else {
                navigate('/login'); // Redirect to login page if not logged in
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            navigate('/login'); // Redirect to login page if error occurs
        });
    }, [navigate]); // Add navigate as a dependency
  
    // Render loading component while checking login status
    if (!isLoggedIn) {
        return <Loading />;
    }
  
    // If logged in, render the homepage content
    return (
        <div>
            <h2>Welcome to the Homepage!</h2>
            {/* Homepage content goes here */}
        </div>
    );
}

export default Homepage;
