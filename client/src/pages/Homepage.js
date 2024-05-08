import { useEffect, useState } from "react";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";
import './Homepage.css';
import Navbar from "../components/Navbar";

const Homepage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dp, setDp] = useState('');
    const navigate = useNavigate();
  
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const response = await fetch("http://localhost:8080/userinfo", {
                    method: "GET",
                    credentials: "include", // Include credentials such as cookies
                });

                const data = await response.json();

                // console.log(data.userData);
                setDp(data.userData.dp);
                if (response.ok) {
                    setIsLoggedIn(true);
                } else {
                    navigate('/login'); // Redirect to login page if not logged in
                }
            } catch (error) {
                console.error("Error:", error);
                navigate('/login'); // Redirect to login page if error occurs
            }
        };
        
        checkLoggedIn();
    }, [navigate]); // Add navigate as a dependency
  
    if (!isLoggedIn) {
        return <Loading />;
    }
  
    return (
        <div className="homepage-main-component">
            <Navbar dp={dp.toString()} />
            <h2>Welcome to the Homepage!</h2>
        </div>
    );
}

export default Homepage;
