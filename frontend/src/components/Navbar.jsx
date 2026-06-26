import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Determine if we are in practice mode to show the correct lobby name
  const isPractice = path.includes('practice') || location.state?.isPractice;
  const lobbyText = isPractice ? 'Practice Lobby' : 'Race Lobby';

  // Helper styles for the nav items
  const activeStyle = { color: '#ff6b2b', fontWeight: 'bold', cursor: 'default' };
  const inactiveStyle = { color: '#666', cursor: 'pointer', transition: 'color 0.2s' };
  const dividerStyle = { color: '#333', margin: '0 12px', fontSize: '12px' };

  return (
    <div className="nav">
      
      {/* Top Left: Logo (Clickable to go home) */}
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Code<span>Race</span>..
      </div>

      {/* Top Right: Dynamic Links */}
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>

        {/* --- HOME PAGE & LEADERBOARD --- */}
        {(path === '/' || path === '/leaderboard') && (
          <>
            <span 
              onClick={() => navigate('/')} 
              style={path === '/' ? activeStyle : inactiveStyle}
              onMouseEnter={(e) => { if(path !== '/') e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { if(path !== '/') e.currentTarget.style.color = '#666' }}
            >
              Home
            </span>
            <span style={dividerStyle}>|</span>
            <span 
              onClick={() => navigate('/leaderboard')} 
              style={path === '/leaderboard' ? activeStyle : inactiveStyle}
              onMouseEnter={(e) => { if (path !== '/leaderboard') e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { if (path !== '/leaderboard') e.currentTarget.style.color = '#666' }}
            >
              Leaderboard
            </span>
          </>
        )}

        {/* --- LOBBY --- */}
        {path.includes('lobby') && (
          <span style={activeStyle}>
            {lobbyText}
          </span>
        )}

        {/* --- RACE --- */}
        {path === '/race' && (
          <span style={activeStyle}>
            Race
          </span>
        )}

        {/* --- RESULT --- */}
        {path === '/result' && (
          <span style={activeStyle}>
            Result
          </span>
        )}

      </div>
    </div>
  );
};

export default Navbar;