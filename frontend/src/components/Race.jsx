import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/socketStore.js';

// --- Extracted Hooks ---
import { useResizablePanels } from '../hooks/race/useResizablePanels.js';
import { useRaceTimer } from '../hooks/race/useRaceTimer.js';
import { useSubmission } from '../hooks/race/useSubmission.js';

// --- Extracted Components ---
import ReadyOverlay from './race/ReadyOverlay.jsx';
import RaceHUD from './race/RaceHUD.jsx';
import SplitHandle from './race/SplitHandle.jsx';
import ProblemPanel from './race/ProblemPanel.jsx';
import EditorPanel from './race/EditorPanel.jsx';
import ConsolePanel from './race/ConsolePanel.jsx';

const Race = () => {
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- Routing & Match State ---
  const storedRoom = sessionStorage.getItem('coderace_active_room');
  const [roomId, setRoomId] = useState(location.state?.roomId || storedRoom || 'ERROR');
  
  const difficulty = (location.state?.difficulty || 'medium').toLowerCase();
  const initialCompany = location.state?.company || 'All';
  const isPractice = location.state?.isPractice || false;
  const matchType = location.state?.matchType || 'Rapid (30 min)';

  // --- Timer Fallback Logic ---
  const getTimeLimit = (type) => {
    if (!type) return 30;
    if (type.includes("Zen")) return -1; 
    if (type.startsWith("Bullet")) return 5;
    if (type.startsWith("Blitz")) return 15;
    if (type.startsWith("Rapid")) return 30;
    if (type.startsWith("Custom")) {
      const match = type.match(/\((\d+)\s*min\)/);
      return match ? Number(match[1]) : 30;
    }
    return 30;
  };
  const timeLimitMinutes = location.state?.timeLimit || getTimeLimit(matchType);

  const [problem, setProblem] = useState(null);
  const [examples, setExamples] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [hints, setHints] = useState([]); // <-- ADDED HINTS STATE
  const [snippetsCache, setSnippetsCache] = useState({});

  const [hasClickedReady, setHasClickedReady] = useState(false);
  const [raceStarted, setRaceStarted] = useState(false); 
  const [opponentProgress, setOpponentProgress] = useState(0);

  // --- Editor State ---
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState("// Waiting for problem...");

  // ==========================================
  // 1. CUSTOM HOOKS
  // ==========================================
  const { leftWidth, bottomHeight, isDragging, setIsDragging } = useResizablePanels();
  
  // Initialize timer
  const { countdown, setCountdown, timeLeft, formatTime } = useRaceTimer(timeLimitMinutes, raceStarted);
  
  // Initialize submission logic
  const { 
    isSubmitting, setIsSubmitting, 
    terminalLogs, setTerminalLogs, 
    myProgress, totalCases, 
    handleSubmitCode,
    handleRunCode 
  } = useSubmission(socket, roomId, problem, isPractice, raceStarted, timeLeft);

  // Wrappers so we can pass current language and code into the hook
  const onSubmit = () => handleSubmitCode(language, code);
  const onRun = () => handleRunCode(language, code); 

  // Time's up effect
  useEffect(() => {
    if (timeLeft === 0 && raceStarted) {
      setTerminalLogs(prev => [...prev, `🚨 TIME UP! Match concluded.`]);
      setIsSubmitting(true); 
    }
  }, [timeLeft, raceStarted, setTerminalLogs, setIsSubmitting]);

  // ==========================================
  // 2. MONACO THEME INJECTION
  // ==========================================
  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('codeRaceTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'ff6b2b', fontStyle: 'bold' },
        { token: 'type', foreground: '2cbb5d' },
        { token: 'string', foreground: 'e5c07b' },
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.lineHighlightBackground': '#161616',
        'editorLineNumber.foreground': '#444444',
        'editorIndentGuide.background': '#1e1e1e',
      }
    });
  };

  // ==========================================
  // 3. SOCKET LISTENERS
  // ==========================================
  useEffect(() => {
    if (!isPractice || !socket || hasClickedReady) return;

    // If we recovered a room from storage, we are reconnecting. Do not create a new one!
    if (roomId === storedRoom && roomId !== 'ERROR') return; 

    const handlePracticeRoomCreated = ({ roomId: newRoomId }) => {
      setRoomId(newRoomId); 
      sessionStorage.setItem('coderace_active_room', newRoomId); // <-- Save immediately
      socket.emit('toggle_ready', { roomId: newRoomId, isReady: true });
    };

    socket.on('room_created', handlePracticeRoomCreated);

    setHasClickedReady(true);
    socket.emit("create_room", { 
      difficulty, company: initialCompany, matchType: 'practice', playerName: 'Solo Player' 
    });

    return () => socket.off('room_created', handlePracticeRoomCreated);
  }, [isPractice, socket, hasClickedReady, difficulty, initialCompany, roomId, storedRoom]);

  useEffect(() => {
    if (!socket) return;
    if (roomId === 'ERROR' && !isPractice) { navigate('/'); return; }

    // --- RECONNECTION HANDSHAKE ---
    const activeRoomId = sessionStorage.getItem('coderace_active_room');
    if (activeRoomId && activeRoomId === roomId && !hasClickedReady) {
      socket.emit('rejoin_room', { roomId });
      setHasClickedReady(true);
    } else if (roomId !== 'ERROR') {
      sessionStorage.setItem('coderace_active_room', roomId);
    }
    // ------------------------------

    socket.on('problem_data', (data) => {
      setProblem(data);
      
      // SAFELY PARSE AND FALLBACK TO [] IF DB RETURNS NULL
      setExamples(data.examples ? (typeof data.examples === 'string' ? JSON.parse(data.examples) : data.examples) : []);
      setConstraints(data.constraints ? (typeof data.constraints === 'string' ? JSON.parse(data.constraints) : data.constraints) : []);
      setHints(data.hints ? (typeof data.hints === 'string' ? JSON.parse(data.hints) : data.hints) : []);
      
      let parsedCompanies = [];
      if (data.companies) parsedCompanies = typeof data.companies === 'string' ? JSON.parse(data.companies) : data.companies;
      if (parsedCompanies.length === 0 && initialCompany !== 'All') parsedCompanies = [initialCompany];
      setCompaniesList(parsedCompanies);
      
      if (data.code_snippets) {
        const snippets = typeof data.code_snippets === 'string' ? JSON.parse(data.code_snippets) : data.code_snippets;
        setSnippetsCache(snippets);
        const initialLang = snippets['cpp'] ? 'cpp' : snippets['java'] ? 'java' : 'python';
        setLanguage(initialLang);
        
        const savedCode = localStorage.getItem(`coderace_${roomId}_${initialLang}`);
        setCode(savedCode || snippets[initialLang] || '// Write your code here');
      }

      if (isPractice) setRaceStarted(true);
    });

    socket.on('start_countdown', ({ seconds }) => {
      // If server says 0 (reconnect), start instantly and skip the interval
      if (seconds === 0) {
        setCountdown(null);
        setRaceStarted(true);
        return;
      }

      setCountdown(seconds);
      let count = seconds;
      const int = setInterval(() => {
        count -= 1;
        if (count > 0) setCountdown(count);
        else if (count === 0) setCountdown('GO!');
        else { clearInterval(int); setCountdown(null); setRaceStarted(true); }
      }, 1000);
    });

    socket.on('opponent_progress', ({ progress }) => setOpponentProgress(progress));
    
    socket.on('match_over', ({ winnerId }) => {
      // Clear session storage on clean match end so it doesn't try to reconnect to an old room later
      sessionStorage.removeItem('coderace_active_room'); 
      navigate('/result', { state: { didIWin: winnerId === socket.id, myProgress, opponentProgress } });
    });

    socket.on('room_error', (data) => {
      setTerminalLogs([`🚨 Server Error: ${data.message}`]);
    });

    return () => {
      socket.off('problem_data'); socket.off('start_countdown');
      socket.off('opponent_progress'); socket.off('match_over'); socket.off('room_error');
    };
  }, [socket, roomId, isPractice, navigate, initialCompany, myProgress, opponentProgress, setCountdown, setTerminalLogs, hasClickedReady]);

  // ==========================================
  // 4. EDITOR ACTIONS
  // ==========================================
  const handleLanguageSelect = (newLang) => {
    setLanguage(newLang);
    const savedCode = localStorage.getItem(`coderace_${roomId}_${newLang}`);
    setCode(savedCode || snippetsCache[newLang] || '// Write your code here');
  };

  const handleCodeChange = (val) => {
    setCode(val);
    localStorage.setItem(`coderace_${roomId}_${language}`, val);
  };

  const handleResetCode = () => {
    if (window.confirm("Reset code to original state? All changes will be lost.")) {
      const originalCode = snippetsCache[language] || '// Write your code here';
      setCode(originalCode);
      localStorage.setItem(`coderace_${roomId}_${language}`, originalCode);
    }
  };

  const handleLeaveMatch = () => {
    if (socket) socket.emit('leave_room', { roomId });
    sessionStorage.removeItem('coderace_active_room'); // Clean up on manual leave
    navigate('/');
  };

  // ==========================================
  // 5. THEME & COLORS 
  // ==========================================
  const colors = {
    bgApp: '#000000', bgPanel: '#0a0a0a', bgHeader: '#121212',
    border: '#1e1e1e', borderHover: '#ff6b2b', textMain: '#eff1f6', textMuted: '#6b7280',
    accent: '#ff6b2b', success: '#2cbb5d', warning: '#ffc107', fail: '#ef4743'
  };

  const availableLanguages = [
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'python', label: 'Python' }
  ];

  return (
    <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: colors.bgApp, color: colors.textMain, fontFamily: "'JetBrains Mono', 'Segoe UI', sans-serif", overflow: 'hidden' }}>
      
      {isDragging && <div style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: isDragging === 'vertical' ? 'col-resize' : 'row-resize' }} />}

      <ReadyOverlay 
        raceStarted={raceStarted} isPractice={isPractice} countdown={countdown}
        hasClickedReady={hasClickedReady} setHasClickedReady={setHasClickedReady}
        socket={socket} roomId={roomId} colors={colors}
      />
      
      <RaceHUD 
        isPractice={isPractice} raceStarted={raceStarted} myProgress={myProgress}
        opponentProgress={opponentProgress} totalCases={totalCases} timeLeft={timeLeft}
        formatTime={formatTime} isSubmitting={isSubmitting} 
        handleSubmitCode={onSubmit}
        handleRunCode={onRun} 
        onLeaveMatch={handleLeaveMatch} colors={colors}
      />

      <div id="workspace-container" style={{ boxSizing: 'border-box', display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden', padding: '6px', gap: '6px' }}>
        
        <ProblemPanel 
          leftWidth={leftWidth} problem={problem} difficulty={difficulty}
          companiesList={companiesList} examples={examples} constraints={constraints} 
          hints={hints} /* <-- ADDED PROP */
          colors={colors}
        />

        <SplitHandle direction="vertical" onMouseDown={() => setIsDragging('vertical')} colors={colors} />

        <div style={{ boxSizing: 'border-box', width: `calc(${100 - leftWidth}% - 10px)`, display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}>
          
          <EditorPanel 
            bottomHeight={bottomHeight} raceStarted={raceStarted} timeLeft={timeLeft}
            language={language} availableLanguages={availableLanguages} handleLanguageSelect={handleLanguageSelect}
            handleResetCode={handleResetCode} code={code} handleCodeChange={handleCodeChange}
            handleEditorWillMount={handleEditorWillMount} colors={colors}
          />

          <SplitHandle direction="horizontal" onMouseDown={() => setIsDragging('horizontal')} colors={colors} />

          <ConsolePanel 
            bottomHeight={bottomHeight} examples={examples} terminalLogs={terminalLogs} colors={colors}
          />

        </div>
      </div>
    </div>
  );
};

export default Race;