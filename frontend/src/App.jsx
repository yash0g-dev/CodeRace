import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from "./components/Home.jsx";
import './App.css';

// A tiny helper component for the Navbar so it highlights the active page
const NavBar = () => {
  const location = useLocation();
  
  return (
    <div className="nav">
      <div className="logo">Code<span>Race</span> ..</div>
      <div className="nav-links">
        <Link to="/" className={`nl ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
        <Link to="/lobby" className={`nl ${location.pathname === '/lobby' ? 'active' : ''}`}>Lobby</Link>
        <Link to="/race" className={`nl ${location.pathname === '/race' ? 'active' : ''}`}>Race</Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="r">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<div style={{padding: '2rem', textAlign: 'center'}}>Lobby UI coming next...</div>} />
          <Route path="/race" element={<div style={{padding: '2rem', textAlign: 'center'}}>Race UI coming next...</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;