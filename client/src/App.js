import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Homepage.js";
import Login from "./authentication/Login.js";
import Register from "./authentication/Register.js";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<Homepage />} ></Route>
          <Route path="/login" element = { <Login /> }></Route>
          <Route path="/register" element = { <Register /> } ></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
