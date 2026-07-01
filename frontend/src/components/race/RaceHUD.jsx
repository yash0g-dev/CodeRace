import React from 'react';

const RaceHUD = ({
  isPractice,
  raceStarted,
  myProgress,
  opponentProgress,
  totalCases,
  timeLeft,
  formatTime,
  isSubmitting,
  handleSubmitCode,
  handleRunCode, // <-- NEW PROP ADDED
  onLeaveMatch,
  colors
}) => {
  return (
    <div style={{ boxSizing: 'border-box', height: '54px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: colors.bgApp, flexShrink: 0, zIndex: 50 }}>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '600' }}>You</span>
          <div style={{ width: '100px', height: '4px', background: '#222', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: colors.accent, width: `${(myProgress / totalCases) * 100}%`, transition: 'width 0.3s ease' }}></div>
          </div>
          <span style={{ fontSize: '12px', color: colors.accent, fontWeight: '700' }}>{myProgress}</span>
        </div>
        
        {!isPractice && (
          <>
            <span style={{ fontSize: '12px', color: '#444', fontWeight: '900' }}>VS</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: colors.success, fontWeight: '700' }}>{opponentProgress}</span>
              <div style={{ width: '100px', height: '4px', background: '#222', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: colors.success, width: `${(opponentProgress / totalCases) * 100}%`, transition: 'width 0.3s ease' }}></div>
              </div>
              <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '600' }}>Opponent</span>
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
        {isSubmitting && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.accent, animation: 'pulse 1s infinite' }} />}
        
        {/* --- RUN BUTTON WIRED UP --- */}
        <button 
          onClick={handleRunCode} 
          disabled={!raceStarted || isSubmitting || timeLeft === 0} 
          style={{ padding: '5px 14px', fontSize: '12px', background: '#1a1a1a', color: '#e8e8e8', border: `1px solid #333`, borderRadius: '6px', cursor: !raceStarted || isSubmitting || timeLeft===0 ? 'not-allowed' : 'pointer', fontWeight: '600', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }} 
          onMouseOver={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.borderColor = '#555'; }} 
          onMouseOut={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#333'; }}
        >
          <span style={{ fontSize: '10px', color: '#888' }}>▶</span> Run
        </button>

        <button 
          onClick={handleSubmitCode} 
          disabled={!raceStarted || isSubmitting || timeLeft === 0} 
          style={{ padding: '5px 16px', fontSize: '12px', background: 'rgba(44, 187, 93, 0.1)', color: colors.success, border: `1px solid rgba(44, 187, 93, 0.3)`, borderRadius: '6px', opacity: raceStarted && timeLeft > 0 ? 1 : 0.5, cursor: isSubmitting || timeLeft===0 ? 'not-allowed' : 'pointer', fontWeight: '600', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }} 
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(44, 187, 93, 0.2)'; e.currentTarget.style.borderColor = 'rgba(44, 187, 93, 0.6)'; }} 
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(44, 187, 93, 0.1)'; e.currentTarget.style.borderColor = 'rgba(44, 187, 93, 0.3)'; }}
        >
          Submit
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px' }}>
        <div style={{ 
          fontSize: '15px', fontWeight: '800', fontVariantNumeric: 'tabular-nums', letterSpacing: '1px',
          color: (timeLeft <= 60 && timeLeft !== -1) ? colors.fail : colors.textMain, // <-- FIXED ZEN MODE FLASHING
          animation: (timeLeft <= 60 && timeLeft > 0) ? 'pulse 1s infinite' : 'none' 
        }}>
          {formatTime(timeLeft)}
        </div>
        <button onClick={onLeaveMatch} style={{ background: 'none', border: `1px solid ${colors.border}`, color: colors.textMuted, padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color=colors.textMuted}>Leave Match</button>
      </div>
    </div>
  );
};

export default RaceHUD;