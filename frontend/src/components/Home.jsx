import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '460px', padding: '2rem' }}>
      <div style={{ width: '380px' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '11px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Multiplayer coding race
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', lineHeight: '1.2', marginBottom: '6px' }}>
            Race your friends.<br />Code faster. <span style={{ color: '#ff6b2b' }}>Win.</span>
          </div>
          <div style={{ fontSize: '12px', color: '#444', marginTop: '10px', lineHeight: '1.8' }}>
            Two players. One problem. First correct solution wins.<br />No accounts. No setup. Just a room code.
          </div>
        </div>

        <div className="divider"></div>

        <div style={{ marginBottom: '12px' }}>
          <input className="mono-input" placeholder="Enter your name" style={{ marginBottom: '10px' }} />
          {/* We will wire this up to Socket.io later, for now it just navigates to the lobby */}
          <button className="btn-primary" onClick={() => navigate('/lobby')}>
            Create race room →
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <input className="mono-input" placeholder="Room code (e.g. RACE42)" style={{ flex: 1 }} />
          <button className="btn-ghost" style={{ width: 'auto', padding: '12px 18px', whiteSpace: 'nowrap' }} onClick={() => navigate('/lobby')}>
            Join →
          </button>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
          <div style={{ fontSize: '11px', color: '#333' }}>No signup required</div>
          <div style={{ fontSize: '11px', color: '#333' }}>Free to use</div>
          <div style={{ fontSize: '11px', color: '#333' }}>Open source</div>
        </div>

      </div>
    </div>
  );
};

export default Home;