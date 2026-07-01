import React, { useState, useEffect } from 'react';

const ConsolePanel = ({
  bottomHeight,
  examples,
  terminalLogs,
  colors
}) => {
  const [bottomTab, setBottomTab] = useState('testcases'); 
  const [activeCase, setActiveCase] = useState(0);

  // Auto-switch to the Result tab whenever new terminal logs are generated
  useEffect(() => {
    if (terminalLogs && terminalLogs.length > 0) {
      setBottomTab('result');
    }
  }, [terminalLogs]);

  return (
    <div style={{ boxSizing: 'border-box', height: `calc(${bottomHeight}% - 3px)`, background: colors.bgPanel, borderRadius: '8px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      <div style={{ boxSizing: 'border-box', display: 'flex', background: colors.bgHeader, borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
        <button onClick={() => setBottomTab('testcases')} style={{ padding: '8px 20px', background: bottomTab === 'testcases' ? colors.bgPanel : 'transparent', border: 'none', color: bottomTab === 'testcases' ? '#fff' : colors.textMuted, cursor: 'pointer', fontSize: '13px', fontWeight: '600', borderTop: bottomTab === 'testcases' ? `2px solid ${colors.accent}` : '2px solid transparent' }}>Testcase</button>
        <button onClick={() => setBottomTab('result')} style={{ padding: '8px 20px', background: bottomTab === 'result' ? colors.bgPanel : 'transparent', border: 'none', color: bottomTab === 'result' ? '#fff' : colors.textMuted, cursor: 'pointer', fontSize: '13px', fontWeight: '600', borderTop: bottomTab === 'result' ? `2px solid ${colors.accent}` : '2px solid transparent' }}>Test Result</button>
      </div>

      <div style={{ boxSizing: 'border-box', flex: 1, padding: '16px', overflowY: 'auto' }}>
        {bottomTab === 'testcases' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {examples.map((_, i) => (
                <button key={i} onClick={() => setActiveCase(i)} style={{ fontSize: '12px', padding: '6px 16px', background: activeCase === i ? '#333' : '#1a1a1a', border: 'none', borderRadius: '6px', color: activeCase === i ? '#fff' : colors.textMuted, cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}>Case {i + 1}</button>
              ))}
            </div>
            {examples[activeCase] && (
              <div style={{ boxSizing: 'border-box', background: '#161616', padding: '12px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontFamily: 'monospace', fontSize: '13px', color: '#e8e8e8', whiteSpace: 'pre-wrap' }}>
                {examples[activeCase].example_text.split('\n')[0].replace('Input: ', '')}
              </div>
            )}
          </div>
        )}
        {bottomTab === 'result' && (
          <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
            {terminalLogs.length === 0 ? <span style={{color: colors.textMuted}}>You must run your code first.</span> : 
              <>
                {terminalLogs[0].includes('✅') && <div style={{ fontSize: '20px', color: colors.success, fontWeight: 'bold', marginBottom: '12px' }}>Accepted</div>}
                {terminalLogs[0].includes('❌') && <div style={{ fontSize: '20px', color: colors.fail, fontWeight: 'bold', marginBottom: '12px' }}>Runtime Error</div>}
                {terminalLogs.map((log, idx) => (
                  <div key={idx} style={{ boxSizing: 'border-box', color: log.includes('❌') || log.includes('🚨') ? colors.fail : log.includes('✅') ? colors.success : '#ccc', padding: '10px', background: '#161616', borderRadius: '6px', border: `1px solid ${colors.border}`, marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{log}</div>
                ))}
              </>
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolePanel;