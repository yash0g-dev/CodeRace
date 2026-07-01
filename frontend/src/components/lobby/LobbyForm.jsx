import React from 'react';

const LobbyForm = ({
  isPracticeMode,
  multiplayerMode,
  playerName,
  difficulty,
  company,
  matchType,
  customTime,
  roomCodeInput,
  focusedInput,
  lobbyError,
  isRequestingRoom,
  primaryText,
  onModeChange,
  onPlayerNameChange,
  onDifficultyChange,
  onCompanyChange,
  onMatchTypeChange,
  onCustomTimeChange,
  onRoomCodeChange,
  onFocusChange,
  onSubmit
}) => {
  // --- Premium UI Helpers Restored ---
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
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  });

  return (
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
          <button onClick={() => { onModeChange('create'); onFocusChange(null); }} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: '600', border: 'none', borderRadius: '6px', background: multiplayerMode === 'create' ? '#1a0f0a' : 'transparent', color: multiplayerMode === 'create' ? '#ff6b2b' : '#666', cursor: 'pointer', transition: 'all 0.2s' }}>Create Room</button>
          <button onClick={() => { onModeChange('join'); onFocusChange(null); }} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: '600', border: 'none', borderRadius: '6px', background: multiplayerMode === 'join' ? '#1a0f0a' : 'transparent', color: multiplayerMode === 'join' ? '#ff6b2b' : '#666', cursor: 'pointer', transition: 'all 0.2s' }}>Join Room</button>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Your Name</div>
        <input 
          placeholder="Hey-Hades" 
          style={inputStyle('name')}
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          onFocus={() => onFocusChange('name')}
          onBlur={() => onFocusChange(null)}
          disabled={isRequestingRoom}
        />
      </div>

      {(isPracticeMode || multiplayerMode === 'create') && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Difficulty</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button disabled={isRequestingRoom} onClick={() => onDifficultyChange('easy')} style={{ flex: 1, padding: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '8px', transition: 'all 0.2s', ...getButtonStyle('easy', difficulty) }}>Easy</button>
              <button disabled={isRequestingRoom} onClick={() => onDifficultyChange('med')} style={{ flex: 1, padding: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '8px', transition: 'all 0.2s', ...getButtonStyle('med', difficulty) }}>Medium</button>
              <button disabled={isRequestingRoom} onClick={() => onDifficultyChange('hard')} style={{ flex: 1, padding: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '8px', transition: 'all 0.2s', ...getButtonStyle('hard', difficulty) }}>Hard</button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Time Control</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              
              {/* 2x2 Symmetrical Grid for presets */}
              {['Bullet (5 min)', 'Blitz (15 min)', 'Rapid (30 min)', 'Zen (No Limit)'].map((time) => (
                <button 
                  key={time} 
                  disabled={isRequestingRoom}
                  onClick={() => onMatchTypeChange(time)} 
                  style={{ 
                    padding: '12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', 
                    fontFamily: 'inherit', borderRadius: '8px', transition: 'all 0.2s', 
                    ...getButtonStyle(time, matchType) 
                  }}
                >
                  {time === 'Zen (No Limit)' ? 'Zen (∞)' : time}
                </button>
              ))}
              
              {/* Full-width Custom Input */}
              <div 
                onClick={() => !isRequestingRoom && onMatchTypeChange('Custom')}
                style={{ 
                  gridColumn: 'span 2', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', padding: '0 12px', cursor: 'text', 
                  borderRadius: '8px', transition: 'all 0.2s', height: '40px',
                  ...getButtonStyle('Custom', matchType) 
                }}
              >
                <input 
                  type="text"
                  placeholder="Custom Time (minutes)"
                  value={customTime}
                  disabled={isRequestingRoom}
                  onChange={(e) => {
                    onCustomTimeChange(e.target.value.replace(/\D/g, ''));
                    onMatchTypeChange('Custom');
                  }}
                  onFocus={() => { onMatchTypeChange('Custom'); onFocusChange('time'); }}
                  onBlur={() => onFocusChange(null)}
                  style={{ 
                    background: 'transparent', border: 'none', 
                    color: matchType === 'Custom' ? '#ff6b2b' : '#666', 
                    fontSize: '12px', fontWeight: '600', outline: 'none', 
                    width: '100%', textAlign: 'center', fontFamily: 'inherit' 
                  }}
                />
              </div>

            </div>
          </div>
              
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Target Company</div>
            <select 
              value={company}
              disabled={isRequestingRoom}
              onChange={(e) => onCompanyChange(e.target.value)}
              style={{ ...inputStyle('company'), cursor: 'pointer' }}
              onFocus={() => onFocusChange('company')}
              onBlur={() => onFocusChange(null)}
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
            placeholder="RACE17" 
            style={{ ...inputStyle('code'), textTransform: 'uppercase', letterSpacing: '2px' }} 
            value={roomCodeInput}
            disabled={isRequestingRoom}
            onChange={(e) => onRoomCodeChange(e.target.value)}
            onFocus={() => onFocusChange('code')}
            onBlur={() => onFocusChange(null)}
          />
        </div>
      )}

      {lobbyError && <div style={{ color: '#ef4743', fontSize: '13px', marginBottom: '16px', textAlign: 'center', fontWeight: '600' }}>{lobbyError}</div>}

      <button 
        disabled={isRequestingRoom}
        style={{ background: '#ff6b2b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '700', padding: '14px 0', width: '100%', cursor: isRequestingRoom ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'transform 0.1s, background 0.2s', boxShadow: '0 4px 14px rgba(255, 107, 43, 0.2)', opacity: isRequestingRoom ? 0.7 : 1 }} 
        onMouseEnter={(e) => !isRequestingRoom && (e.currentTarget.style.background = '#ff824d')}
        onMouseLeave={(e) => !isRequestingRoom && (e.currentTarget.style.background = '#ff6b2b')}
        onMouseDown={(e) => !isRequestingRoom && (e.currentTarget.style.transform = 'scale(0.98)')}
        onMouseUp={(e) => !isRequestingRoom && (e.currentTarget.style.transform = 'scale(1)')}
        onClick={onSubmit}
      >
        {primaryText}
      </button>
    </>
  );
};

export default LobbyForm;