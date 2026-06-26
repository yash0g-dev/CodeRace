import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '2rem' }}>
      <div style={{ width: '400px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
            CodeRace
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', lineHeight: '1.2', marginBottom: '6px' }}>
            Race your friends.<br />Code faster. <span style={{ color: '#ff6b2b' }}>Win.</span>
          </div>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '10px', lineHeight: '1.8' }}>
            Choose your mode. Hone your skills solo or challenge an opponent in a multiplayer coding race.
          </div>
        </div>

        <div className="divider" style={{ borderBottom: '1px solid #1e1e1e', marginBottom: '20px' }}></div>

        {/* --- GAME MODES PANEL --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <button 
            onClick={() => navigate('/practice-lobby')}
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: '#0a0a0a', 
              border: '1px solid #1e1e1e', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              textAlign: 'left', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff6b2b44'; e.currentTarget.style.background = '#111'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#0a0a0a'; }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Practice Mode</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Train solo against the clock</div>
            </div>
            <span style={{ color: '#ff6b2b', fontWeight: 'bold' }}>→</span>
          </button>

          <button 
            onClick={() => navigate('/lobby')}
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: '#0a0a0a', 
              border: '1px solid #1e1e1e', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              textAlign: 'left', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff6b2b44'; e.currentTarget.style.background = '#111'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#0a0a0a'; }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Create / Join Race Room</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Host or join a 1v1 multiplayer race</div>
            </div>
            <span style={{ color: '#ff6b2b', fontWeight: 'bold' }}>→</span>
          </button>

        </div>

        {/* --- FOOTER LINKS --- */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
          <button 
            className="btn-ghost" 
            style={{ fontSize: '11px', color: '#666', padding: 0, height: 'auto', background: 'transparent', border: 'none', cursor: 'pointer' }} 
            onClick={() => navigate('/leaderboard')}
          >
            View Rankings 🏆
          </button>
        </div>

      </div>
    </div>
  );
};

export default Home;