import { useState } from 'react';

const ProblemPanel = ({
  leftWidth,
  problem,
  difficulty,
  companiesList,
  examples,
  constraints,
  hints, // <-- Make sure this is destructured
  colors
}) => {
  // Local state moved out of Race.jsx
  const [leftTab, setLeftTab] = useState('description');
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(false);

  // Styling logic moved out of Race.jsx
  const getDiffStyles = (diff) => {
    if (diff === 'easy') return { color: colors.success, bg: '#2cbb5d15', border: '#2cbb5d40' };
    if (diff === 'medium' || diff === 'med') return { color: colors.warning, bg: '#ffc10715', border: '#ffc10740' };
    if (diff === 'hard') return { color: colors.fail, bg: '#ef474315', border: '#ef474340' };
    return { color: colors.textMuted, bg: '#222', border: '#333' };
  };
  const diffStyles = getDiffStyles(difficulty);

  const cleanDescription = problem?.description
    ?.replace(/Example \d+:/gi, '')
    ?.replace(/Constraints:/gi, '')
    ?.trim();

  return (
    <div style={{ boxSizing: 'border-box', width: `${leftWidth}%`, background: colors.bgPanel, borderRadius: '8px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', background: colors.bgHeader, borderBottom: `1px solid ${colors.border}` }}>
        <button onClick={() => setLeftTab('description')} style={{ padding: '10px 16px', background: leftTab === 'description' ? colors.bgPanel : 'transparent', border: 'none', color: leftTab === 'description' ? '#fff' : colors.textMuted, borderTop: leftTab === 'description' ? `2px solid ${colors.accent}` : '2px solid transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Description</button>
        <button onClick={() => setLeftTab('hints')} style={{ padding: '10px 16px', background: leftTab === 'hints' ? colors.bgPanel : 'transparent', border: 'none', color: leftTab === 'hints' ? '#fff' : colors.textMuted, borderTop: leftTab === 'hints' ? `2px solid ${colors.accent}` : '2px solid transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          Hints {hints && hints.length > 0 ? `(${hints.length})` : ''}
        </button>
      </div>
      
      <div style={{ boxSizing: 'border-box', flex: 1, overflowY: 'auto', padding: '24px' }}>
        {!problem ? (<div style={{ color: colors.textMuted }}>Loading problem...</div>) : leftTab === 'description' ? (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '16px' }}>
              {problem.leetcode_id ? `${problem.leetcode_id}. ` : ''}{problem.title}
            </h1>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', padding: '4px 12px', background: diffStyles.bg, color: diffStyles.color, border: `1px solid ${diffStyles.border}`, borderRadius: '99px', fontWeight: '600', textTransform: 'capitalize' }}>
                {difficulty}
              </span>
              
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsCompaniesOpen(!isCompaniesOpen)}
                  style={{ fontSize: '12px', padding: '4px 12px', background: '#161616', border: `1px solid ${colors.border}`, color: '#ccc', borderRadius: '99px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = colors.textMuted}
                  onMouseOut={e => e.currentTarget.style.borderColor = colors.border}
                >
                  🏢 Companies {companiesList.length > 0 ? `(${companiesList.length})` : ''}
                </button>
                {isCompaniesOpen && (
                  <div style={{ boxSizing: 'border-box', position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(12px)', border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px', zIndex: 100, minWidth: '220px', boxShadow: '0 10px 40px rgba(0,0,0,0.9)' }}>
                    <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Asked By</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {companiesList.length > 0 ? companiesList.map((comp, i) => (
                        <span key={i} style={{ background: '#2a2a2a', border: `1px solid ${colors.border}`, padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: '#fff' }}>{comp}</span>
                      )) : <span style={{ color: '#888', fontSize: '12px' }}>General Algorithm</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ fontSize: '14px', color: '#d4d4d4', lineHeight: '1.7', marginBottom: '32px', whiteSpace: 'pre-wrap', fontFamily: 'system-ui, sans-serif' }}>
              {cleanDescription}
            </div>
            
            {examples.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {examples.map((ex, idx) => (
                  <div key={idx}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Example {idx + 1}:</div>
                    <div style={{ boxSizing: 'border-box', background: '#161616', borderLeft: `3px solid ${colors.border}`, padding: '16px', fontSize: '13px', color: '#e8e8e8', whiteSpace: 'pre-wrap', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
                      {ex.example_text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {constraints && constraints.length > 0 && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>Constraints:</div>
                <ul style={{ paddingLeft: '20px', color: '#d4d4d4', fontSize: '13px', lineHeight: '1.8', fontFamily: "'JetBrains Mono', monospace" }}>
                  {constraints.map((c, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      <code style={{ background: '#161616', padding: '2px 6px', borderRadius: '4px', border: `1px solid ${colors.border}`, color: '#e8e8e8' }}>{c}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ color: colors.warning, fontSize: '13px', marginBottom: '8px', padding: '12px', background: 'rgba(255, 193, 7, 0.1)', border: `1px solid rgba(255, 193, 7, 0.3)`, borderRadius: '6px' }}>
              ⚠️ Using hints will not actually deduct ELO yet, but they will in the future! Use them strategically.
            </div>
            
            {hints && hints.length > 0 ? (
              hints.map((hint, index) => (
                <div key={index} style={{ background: '#161616', border: `1px solid ${colors.border}`, padding: '16px', borderRadius: '8px', fontSize: '14px', color: '#d4d4d4', lineHeight: '1.6' }}>
                  <strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>Hint {index + 1}</strong>
                  {hint}
                </div>
              ))
            ) : (
              <div style={{ color: colors.textMuted, textAlign: 'center', marginTop: '40px' }}>
                No hints available for this problem. You're on your own!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPanel;