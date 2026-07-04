import React from 'react';

const ScoreCard = ({ didIWin, myScore, opponentScore, myProgress, opponentProgress }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'stretch', marginBottom: '24px' }}>
      
      {/* Winner Box */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#0a0a0a', border: '1px solid #ff6b2b44', borderRadius: '12px', padding: '24px 16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#ff6b2b' }}></div>
        <div style={{ fontSize: '10px', color: '#ff6b2b', marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>winner</div>
        
        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#1a0f0a', border: '1px solid #ff6b2b44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800', color: '#ff6b2b', margin: '0 auto 12px' }}>
          {didIWin ? 'P1' : 'P2'}
        </div>
        <div style={{ fontSize: '15px', color: '#fff', fontWeight: '600' }}>
          {didIWin ? 'You' : 'Opponent'}
        </div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: '#ff6b2b', marginTop: '8px' }}>
          {didIWin ? myScore : opponentScore}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '6px', fontWeight: '500' }}>
          {didIWin ? `${myProgress}/5 passed` : `${opponentProgress}/5 passed`}
        </div>
      </div>

      {/* VS Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '13px', color: '#444', fontWeight: '800', background: '#111', padding: '6px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
          vs
        </div>
      </div>

      {/* Loser Box */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', color: '#555', marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>
          {didIWin ? 'opponent' : 'you'}
        </div>
        
        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#111', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800', color: '#555', margin: '0 auto 12px' }}>
            {didIWin ? 'P2' : 'P1'}
        </div>
        <div style={{ fontSize: '15px', color: '#e8e8e8', fontWeight: '600' }}>
          {didIWin ? 'Opponent' : 'You'}
        </div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: '#e8e8e8', marginTop: '8px' }}>
          {didIWin ? opponentScore : myScore}
        </div>
        <div style={{ fontSize: '12px', color: '#555', marginTop: '6px', fontWeight: '500' }}>
          {didIWin ? `${opponentProgress}/5 passed` : `${myProgress}/5 passed`}
        </div>
      </div>
      
    </div>
  );
};

export default ScoreCard;