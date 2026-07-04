import React from 'react';

const ReadyOverlay = ({
  raceStarted,
  isPractice,
  countdown,
  hasClickedReady,
  setHasClickedReady,
  socket,
  roomId,
  colors
}) => {
  // If the race has officially started, hide the overlay completely.
  // We leave this check exactly as you had it.
  if (raceStarted || isPractice) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {countdown !== null ? (
         <div style={{ 
             // Dynamically shrink the text a bit for the word "GO!"
             fontSize: countdown <= 0 ? '140px' : '180px', 
             // Turn green when it hits GO!
             color: countdown <= 0 ? colors.success : colors.accent, 
             fontWeight: '900', 
             // Make the neon glow match the color
             textShadow: `0 0 60px ${countdown <= 0 ? colors.success : colors.accent}66` 
         }}>
             {/* THE FIX: Hide 4s, print 3 2 1, and swap 0 for GO! */}
             {countdown > 0 ? (countdown > 3 ? 3 : countdown) : "GO!"}
         </div>
      ) : (
         <div style={{ boxSizing: 'border-box', textAlign: 'center', width: '380px', background: colors.bgPanel, border: `1px solid ${colors.border}`, padding: '40px', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Arena Ready</h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px' }}>Waiting for both players...</p>
            {!hasClickedReady ? (
              <button 
                onClick={() => { 
                  setHasClickedReady(true); 
                  socket?.emit('toggle_ready', { roomId, isReady: true }); 
                }} 
                style={{ width: '100%', padding: '16px', background: colors.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
              >
                Ready Up ⚡
              </button>
            ) : (
              <div style={{ padding: '16px', color: colors.accent, fontWeight: '600', animation: 'pulse 1.5s infinite', border: `1px solid ${colors.accent}44`, borderRadius: '8px', background: '#ff6b2b11' }}>Waiting for opponent...</div>
            )}
         </div>
      )}
    </div>
  );
};

export default ReadyOverlay;