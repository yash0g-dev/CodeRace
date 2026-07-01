import React from 'react';
import PlayerCard from './PlayerCard.jsx';

const WaitingRoom = ({
  roomId,
  playerName,
  opponentName,
  amIReady,
  isOpponentReady,
  matchLabel,
  difficulty,
  copied,
  lobbyError,
  onCopy,
  onToggleReady,
  onCancel,
}) => {
  return (
    <div style={{ background: '#080808', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '32px 24px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Restored Blurred Glow */}
      <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '160px', height: '80px', background: '#ff6b2b', filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none' }}></div>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '10px', color: '#ff6b2b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Arena Ready</div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '3px', fontFamily: 'monospace' }}>{roomId}</div>
          <button 
            onClick={onCopy}
            style={{ fontSize: '10px', fontWeight: 'bold', padding: '6px 10px', background: copied ? '#4caf5022' : '#111', border: `1px solid ${copied ? '#4caf50' : '#333'}`, borderRadius: '6px', color: copied ? '#4caf50' : '#888', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' }}
          >
            {copied ? '✓ COPIED' : 'COPY'}
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          {matchLabel} • {difficulty.toUpperCase()}
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #1e1e1e', margin: '0 -24px 20px -24px' }}></div>

      {lobbyError && <div style={{ color: '#ef4743', fontSize: '13px', marginBottom: '16px', textAlign: 'center', fontWeight: '600' }}>{lobbyError}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
        <PlayerCard name={playerName || 'You'} ready={amIReady} isEmpty={false} isOpponent={false} />
        
        <div style={{ fontSize: '12px', color: '#444', fontWeight: '800', textAlign: 'center' }}>VS</div>
        
        <PlayerCard name={opponentName || 'waiting...'} ready={isOpponentReady} isEmpty={!opponentName} isOpponent={true} />
      </div>

      {opponentName && (
        <button 
          style={{ background: amIReady ? '#1e1e1e' : '#ff6b2b', border: 'none', borderRadius: '8px', color: amIReady ? '#aaa' : '#fff', fontSize: '13px', fontWeight: '700', padding: '14px 0', width: '100%', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '16px', transition: 'all 0.2s', boxShadow: amIReady ? 'none' : '0 4px 14px rgba(255, 107, 43, 0.2)' }} 
          onClick={onToggleReady}
        >
          {amIReady ? 'Cancel Ready Status' : 'Lock In & Ready Up ⚡'}
        </button>
      )}

      <div style={{ textAlign: 'center' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#666', fontSize: '11px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>← Leave arena</button>
      </div>
    </div>
  );
};

export default WaitingRoom;