import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext.jsx';

const Lobby = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  
  const isPracticeMode = location.pathname.includes('practice');

  // --- Setup States (All reset on refresh) ---
  const [multiplayerMode, setMultiplayerMode] = useState('create');
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('med');
  const [company, setCompany] = useState('All');
  const [matchType, setMatchType] = useState('Blitz (15 min)');
  const [customTime, setCustomTime] = useState(''); 
  const [roomCodeInput, setRoomCodeInput] = useState('');
  
  // --- Waiting Room States ---
  const [isWaiting, setIsWaiting] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [opponentName, setOpponentName] = useState(null);
  const [amIReady, setAmIReady] = useState(false);
  const [isOpponentReady, setIsOpponentReady] = useState(false);
  
  // --- UI States ---
  const [copied, setCopied] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // --- Socket Listeners ---
  useEffect(() => {
    if (!socket || isPracticeMode) return;

    socket.on('room_created', ({ roomId }) => {
      setRoomId(roomId);
      setIsWaiting(true); 
    });

    socket.on('room_joined', ({ roomId, creatorName, difficulty, company, matchType }) => {
      setRoomId(roomId);
      setOpponentName(creatorName);
      setDifficulty(difficulty); 
      setCompany(company);       
      setMatchType(matchType);
      setIsWaiting(true);
    });

    socket.on('player_joined', ({ joinerName }) => {
      setOpponentName(joinerName);
    });

    socket.on('player_ready_status', ({ playerId, isReady }) => {
      if (playerId === socket.id) setAmIReady(isReady);
      else setIsOpponentReady(isReady);
    });

    socket.on('match_started', ({ roomId, difficulty, company, matchType }) => {
      navigate('/race', { state: { roomId, difficulty, company, matchType, isPractice: false } });
    });

    socket.on('room_error', ({ message }) => {
      alert(message);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('player_joined');
      socket.off('player_ready_status');
      socket.off('match_started');
      socket.off('room_error');
    };
  }, [socket, navigate, isPracticeMode]);

  // --- Actions ---

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        alert("Failed to copy code. Please highlight and copy manually.");
      }
      document.body.removeChild(textArea);
    }
  };

  const getFinalMatchType = () => {
    return matchType === 'Custom' ? `Custom (${customTime || '10'} min)` : matchType;
  };

  const handleStartPractice = () => {
    if (!playerName.trim()) return alert("Please enter your name first!");
    navigate('/race', { state: { difficulty, company, matchType: getFinalMatchType(), isPractice: true } });
  };

  const handleCreateRoom = () => {
    if (!socket) return alert('Still connecting to server...');
    if (!playerName.trim()) return alert("Please enter your name first!");
    socket.emit('create_room', { difficulty, company, matchType: getFinalMatchType(), playerName });
  };

  const handleJoinRoom = () => {
    if (!socket) return alert('Still connecting to server...');
    if (!playerName.trim()) return alert("Please enter your name first!");
    if (!roomCodeInput.trim()) return alert('Please enter a room code');
    socket.emit('join_room', { roomId: roomCodeInput.trim().toUpperCase(), playerName });
  };

  const toggleReady = () => {
    socket.emit('toggle_ready', { roomId, isReady: !amIReady });
  };

  const handleCancel = () => {
    socket.emit('leave_room', { roomId });
    setIsWaiting(false);
    setRoomId(null);
    setOpponentName(null);
    setAmIReady(false);
    setIsOpponentReady(false);
    navigate('/');
  };

  // --- Premium UI Helpers ---
  const getButtonStyle = (level, currentVal) => {
    const isSelected = currentVal === level;
    if (!isSelected) return { background: '#0a0a0a', border: '1px solid #1e1e1e', color: '#666' };
    if (level === 'easy') return { background: '#0a1a0a', border: '1px solid #2d5a2d', color: '#4caf50' };
    if (level === 'hard') return { background: '#1a0000', border: '1px solid #3a0a0a', color: '#f44336' };
    return { background: '#1a0f0a', border: '1px solid #ff6b2b44', color: '#ff6b2b' }; 
  };

  const inputStyle = (id) => ({
    width: '100%',
    background: '#0a0a0a',
    border: `1px solid ${focusedInput === id ? '#ff6b2b' : '#1e1e1e'}`,
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    padding: '12px 14px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s'
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 'calc(100vh - 70px)', padding: '2rem' }}>
      <div style={{ width: '400px' }}>

        {!isWaiting ? (
          /* --- SETUP VIEW --- */
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '11px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>
                {isPracticeMode ? 'Solo Training' : 'Multiplayer Arena'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', lineHeight: '1.2', marginBottom: '6px', letterSpacing: '-0.5px' }}>
                {isPracticeMode ? 'Hone your skills.' : multiplayerMode === 'create' ? 'Set up your match.' : 'Join the arena.'}
              </div>
              <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.6' }}>
                {isPracticeMode 
                  ? 'Select a difficulty and target company to begin your offline practice session.' 
                  : multiplayerMode === 'create' 
                    ? 'Configure the match settings to generate a secure room code for your opponent.' 
                    : 'Enter the room code provided by your opponent to join their match.'}
              </div>
            </div>

            {!isPracticeMode && (
              <div style={{ display: 'flex', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '4px', marginBottom: '16px' }}>
                <button onClick={() => setMultiplayerMode('create')} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: '600', border: 'none', borderRadius: '6px', background: multiplayerMode === 'create' ? '#1a0f0a' : 'transparent', color: multiplayerMode === 'create' ? '#ff6b2b' : '#666', cursor: 'pointer', transition: 'all 0.2s' }}>Create Room</button>
                <button onClick={() => setMultiplayerMode('join')} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: '600', border: 'none', borderRadius: '6px', background: multiplayerMode === 'join' ? '#1a0f0a' : 'transparent', color: multiplayerMode === 'join' ? '#ff6b2b' : '#666', cursor: 'pointer', transition: 'all 0.2s' }}>Join Room</button>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Your Name</div>
              <input 
                className="mono-input" 
                placeholder="Hey-Hades" 
                style={inputStyle('name')}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
            </div>

            {(isPracticeMode || multiplayerMode === 'create') && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Difficulty</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setDifficulty('easy')} style={{ flex: 1, padding: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '8px', transition: 'all 0.2s', ...getButtonStyle('easy', difficulty) }}>Easy</button>
                    <button onClick={() => setDifficulty('med')} style={{ flex: 1, padding: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '8px', transition: 'all 0.2s', ...getButtonStyle('med', difficulty) }}>Medium</button>
                    <button onClick={() => setDifficulty('hard')} style={{ flex: 1, padding: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '8px', transition: 'all 0.2s', ...getButtonStyle('hard', difficulty) }}>Hard</button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Time Control</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {['Bullet (5 min)', 'Blitz (15 min)', 'Rapid (30 min)'].map((time) => (
                      <button 
                        key={time} 
                        onClick={() => setMatchType(time)} 
                        style={{ padding: '12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '8px', transition: 'all 0.2s', ...getButtonStyle(time, matchType) }}
                      >
                        {time}
                      </button>
                    ))}
                    
                    <div 
                      onClick={() => setMatchType('Custom')}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: '0 12px', 
                        cursor: 'text', 
                        borderRadius: '8px', 
                        transition: 'all 0.2s', 
                        ...getButtonStyle('Custom', matchType) 
                      }}
                    >
                      <input 
                        type="text"
                        placeholder="Custom (min)"
                        value={customTime}
                        onChange={(e) => {
                          setCustomTime(e.target.value.replace(/\D/g, ''));
                          setMatchType('Custom');
                        }}
                        onFocus={() => setMatchType('Custom')}
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: matchType === 'Custom' ? '#ff6b2b' : '#666', 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          outline: 'none', 
                          width: '100%', 
                          textAlign: 'center', 
                          fontFamily: 'inherit' 
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Target Company</div>
                  <select 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{ ...inputStyle('company'), cursor: 'pointer', appearance: 'none' }}
                    onFocus={() => setFocusedInput('company')}
                    onBlur={() => setFocusedInput(null)}
                  >
                    <option value="All">All Companies (Random)</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Apple">Apple</option>
                    <option value="Google">Google</option>
                    <option value="Microsoft">Microsoft</option>
                  </select>
                </div>
              </>
            )}

            {(!isPracticeMode && multiplayerMode === 'join') && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Room Code</div>
                <input 
                  className="mono-input" 
                  placeholder="RACE17" 
                  style={{ ...inputStyle('code'), textTransform: 'uppercase', letterSpacing: '2px' }} 
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value)}
                  onFocus={() => setFocusedInput('code')}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
            )}

            <button 
              style={{ background: '#ff6b2b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '700', padding: '14px 0', width: '100%', cursor: 'pointer', fontFamily: 'inherit', transition: 'transform 0.1s, background 0.2s', boxShadow: '0 4px 14px rgba(255, 107, 43, 0.2)' }} 
              onMouseEnter={(e) => e.currentTarget.style.background = '#ff824d'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ff6b2b'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onClick={isPracticeMode ? handleStartPractice : (multiplayerMode === 'create' ? handleCreateRoom : handleJoinRoom)}
            >
              {isPracticeMode ? 'Start practice session →' : (multiplayerMode === 'create' ? 'Create race room →' : 'Join race room →')}
            </button>
            
          </>
        ) : (
          /* --- WAITING ROOM VIEW --- */
          <div style={{ background: '#080808', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '32px 24px', position: 'relative', overflow: 'hidden' }}>
            
            <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '160px', height: '80px', background: '#ff6b2b', filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none' }}></div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '10px', color: '#ff6b2b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Arena Ready</div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '3px', fontFamily: 'monospace' }}>{roomId}</div>
                <button 
                  onClick={handleCopy}
                  style={{ fontSize: '10px', fontWeight: 'bold', padding: '6px 10px', background: copied ? '#4caf5022' : '#111', border: `1px solid ${copied ? '#4caf50' : '#333'}`, borderRadius: '6px', color: copied ? '#4caf50' : '#888', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' }}
                >
                  {copied ? '✓ COPIED' : 'COPY'}
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                {matchType === 'Custom' ? `Custom (${customTime || '10'} min)` : matchType} • {difficulty.toUpperCase()}
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #1e1e1e', margin: '0 -24px 20px -24px' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
              
              <div style={{ background: '#0a0a0a', border: `1px solid ${amIReady ? '#4caf50' : '#1e1e1e'}`, borderRadius: '10px', padding: '16px 10px', textAlign: 'center', transition: 'all 0.3s', boxShadow: amIReady ? '0 0 16px rgba(76, 175, 80, 0.05)' : 'none' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a0f0a', border: '1px solid #ff6b2b44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#ff6b2b', margin: '0 auto 10px', textTransform: 'uppercase' }}>{playerName.substring(0, 2)}</div>
                <div style={{ fontSize: '12px', color: '#fff', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{playerName || 'You'}</div>
                <div style={{ fontSize: '10px', color: amIReady ? '#4caf50' : '#ff9800', marginTop: '6px', fontWeight: '600' }}>{amIReady ? '● READY' : '○ SETUP'}</div>
              </div>
              
              <div style={{ fontSize: '12px', color: '#444', fontWeight: '800', textAlign: 'center' }}>VS</div>
              
              <div style={{ background: '#0a0a0a', border: `1px solid ${isOpponentReady ? '#4caf50' : '#1e1e1e'}`, borderRadius: '10px', padding: '16px 10px', textAlign: 'center', transition: 'all 0.3s', boxShadow: isOpponentReady ? '0 0 16px rgba(76, 175, 80, 0.05)' : 'none' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: opponentName ? '#aaa' : '#444', margin: '0 auto 10px', textTransform: 'uppercase', fontWeight: '800' }}>{opponentName ? opponentName.substring(0, 2) : '?'}</div>
                <div style={{ fontSize: '12px', color: opponentName ? '#fff' : '#555', fontWeight: opponentName ? '700' : 'normal', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{opponentName || 'waiting...'}</div>
                <div style={{ fontSize: '10px', color: !opponentName ? '#444' : isOpponentReady ? '#4caf50' : '#ff9800', marginTop: '6px', fontWeight: '600' }}>{!opponentName ? '○ EMPTY' : isOpponentReady ? '● READY' : '○ SETUP'}</div>
              </div>
            </div>

            {opponentName && (
              <button 
                style={{ background: amIReady ? '#1e1e1e' : '#ff6b2b', border: 'none', borderRadius: '8px', color: amIReady ? '#aaa' : '#fff', fontSize: '13px', fontWeight: '700', padding: '14px 0', width: '100%', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '16px', transition: 'all 0.2s', boxShadow: amIReady ? 'none' : '0 4px 14px rgba(255, 107, 43, 0.2)' }} 
                onClick={toggleReady}
              >
                {amIReady ? 'Cancel Ready Status' : 'Lock In & Ready Up ⚡'}
              </button>
            )}

            <div style={{ textAlign: 'center' }}>
              <button onClick={handleCancel} style={{ background: 'none', border: 'none', color: '#666', fontSize: '11px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>← Leave arena</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Lobby;