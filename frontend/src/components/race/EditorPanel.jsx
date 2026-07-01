import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const EditorPanel = ({
  bottomHeight,
  raceStarted,
  timeLeft,
  language,
  availableLanguages,
  handleLanguageSelect,
  handleResetCode,
  code,
  handleCodeChange,
  handleEditorWillMount,
  colors
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <div style={{ boxSizing: 'border-box', height: `calc(${100 - bottomHeight}% - 3px)`, background: colors.bgPanel, borderRadius: '8px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: colors.bgHeader, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            disabled={!raceStarted}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', padding: '6px 12px', borderRadius: '4px', cursor: raceStarted ? 'pointer' : 'not-allowed', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#222'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            {availableLanguages.find(l => l.id === language)?.label || 'C++'} <span style={{ fontSize: '9px', color: '#666' }}>▼</span>
          </button>
          {isLangOpen && raceStarted && (
            <div style={{ boxSizing: 'border-box', position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#1e1e1e', border: `1px solid ${colors.border}`, borderRadius: '6px', overflow: 'hidden', zIndex: 100, minWidth: '120px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {availableLanguages.map(lang => (
                <div 
                  key={lang.id} 
                  onClick={() => { handleLanguageSelect(lang.id); setIsLangOpen(false); }}
                  style={{ padding: '10px 16px', fontSize: '13px', color: '#e8e8e8', cursor: 'pointer', background: language === lang.id ? '#2a2a2a' : 'transparent', fontWeight: language === lang.id ? '700' : '500' }}
                  onMouseOver={e => e.currentTarget.style.background = '#333'}
                  onMouseOut={e => e.currentTarget.style.background = language === lang.id ? '#2a2a2a' : 'transparent'}
                >
                  {lang.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleResetCode} title="Reset to original snippet" disabled={!raceStarted} style={{ background: 'transparent', border: 'none', color: colors.textMuted, cursor: raceStarted ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color=colors.textMuted}>
          <span style={{ fontSize: '16px' }}>↺</span> <span style={{ fontSize: '12px', fontWeight: '600' }}>Reset</span>
        </button>
      </div>
      
      <div style={{ boxSizing: 'border-box', flex: 1, padding: '8px 0' }}>
        <Editor
          height="100%" width="100%" 
          theme="codeRaceTheme"
          language={language === 'python' ? 'python' : language}
          value={code} onChange={handleCodeChange}
          beforeMount={handleEditorWillMount}
          options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontLigatures: true, scrollBeyondLastLine: false, readOnly: !raceStarted || timeLeft === 0 }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;