import "./App.css";
import Logo from '../src/assets/of_logo.png';

function App() {
  return (
    <div className="App">
      <img src={Logo} className="logo" alt="Logo" />
      <h1 className="heading">
        <span className="heading1">Only</span>
        <span className="heading2">Chats</span>{" "}
      </h1>
    </div>
  );
}
  
export default App;
