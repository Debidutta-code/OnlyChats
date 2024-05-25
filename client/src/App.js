import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./authentication/Login.js";
import Register from "./authentication/Register.js";
import Homepage from "./pages/Homepage.js";
import { UserProvider } from "./UserContext.js";
import ProfileUpdate from "./pages/ProfileUpdate.js";

function App() {
  return (
    <div className="App">
      <Router>
        <UserProvider>
          <Routes>
            <Route exact path="/" element={<Homepage />} ></Route>
            <Route path="*" element = { <Homepage /> }></Route>
            <Route path="/login" element = { <Login /> }></Route>
            <Route path="/register" element = { <Register /> } ></Route>
            <Route path="/profileupdate" element = { <ProfileUpdate /> } ></Route>
          </Routes>
        </UserProvider>
      </Router>
    </div>
  )
}

export default App;
