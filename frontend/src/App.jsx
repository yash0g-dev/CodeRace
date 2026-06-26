import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import Lobby from './components/Lobby.jsx';
import Race from './components/Race.jsx';
import Result from './components/Result.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import Navbar from './components/Navbar.jsx'; // <-- Imported our new Breadcrumb Navbar
import './App.css';

function App() {
  return (
    <Router>
      {/* The Navbar sits outside the Routes so it renders on every page */}
      <Navbar /> 
      
      {/* The main page content will render below the navbar with our dark theme background */}
      <div style={{ background: '#050505', minHeight: 'calc(100vh - 60px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/practice-lobby" element={<Lobby />} /> {/* Currently points to Lobby, we can customize this next */}
          <Route path="/race" element={<Race />} />
          <Route path="/result" element={<Result />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;