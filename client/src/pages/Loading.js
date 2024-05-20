import React from "react";
import Logo from "../assets/of_logo.png";
import "./Loading.css";
import { BarLoader } from "react-spinners";

const Loading = () => {
  // Determine the width of the BarLoader based on the screen size
  const barLoaderWidth = window.innerWidth <= 768 ? 250 : 400;

  return (
    <div className="loading-page">
      <div className="loading-content">
        <img src={Logo} className="loading-logo" alt="Logo" />
        <h1 className="loading-heading">
          <span className="loading-heading1">Only</span>
          <span className="loading-heading2">Chats</span>{" "}
        </h1>
      </div>
      <BarLoader color="#008BCA" height={1} speedMultiplier={1} width={barLoaderWidth} />
    </div>
  );
};

export default Loading;
