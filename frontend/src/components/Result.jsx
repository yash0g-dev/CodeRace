import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 👉 Make sure you ran 'npm install axios' in your frontend!
import { useSocket } from '../context/socketStore.js';

// --- Extracted Components ---
import MatchStats from './result/MatchStats.jsx';
import AIReview from './result/AIReview.jsx';

const Result = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();

  // 1. Grab data passed from the Race arena
  const { 
    didIWin = false, 
    myName = 'You',
    opponentName = 'Opponent',
    myCode = '', // 👉 Catching your submitted code
    problemTitle = 'a coding challenge' 
  } = location.state || {};

  // 2. Dynamic state ready for your backend OpenAI response
  const [aiFeedback, setAiFeedback] = useState("Waiting for AI analysis...");

  // 👉 INSIDE Result.jsx
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const { data } = await axios.post('https://coderace-5xw6.onrender.com/api/ai/review', {
          code: myCode,
          problemTitle: problemTitle,
          didIWin: didIWin // 👉 Now the AI knows the context of the match!
        });
        setAiFeedback(data.review);
      } catch (error) {
        console.error("AI Fetch Error:", error);
        setAiFeedback("AI Analysis unavailable. Ensure your backend is running and API keys are valid.");
      }
    };

    // Only run the review if we actually have code to analyze
    if (myCode && myCode !== "// Waiting for problem...") {
      fetchReview();
    } else {
      setAiFeedback("No code submitted to analyze.");
    }
  }, [myCode, problemTitle]);

  // 4. Single action: Clean up the socket, then immediately go queue up again
  const handleNewRace = () => {
    if (socket) {
      socket.emit('leave_room'); 
    }
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '2rem', background: '#000' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* Shows who won based on the names */}
        <MatchStats didIWin={didIWin} opponentName={opponentName} />

        <div style={{ height: '1px', background: '#1e1e1e', margin: '24px 0', width: '100%' }}></div>

        {/* Dynamic AI Review Box */}
        <AIReview reviewText={aiFeedback} />

        {/* Massive Call to Action */}
        <div style={{ marginTop: '24px' }}>
          <button 
            style={{ 
              width: '100%', padding: '16px 0', background: '#ff6b2b', color: '#fff', 
              border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '800', 
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px'
            }} 
            onClick={handleNewRace}
          >
            New Race ⚡
          </button>
        </div>

      </div>
    </div>
  );
};

export default Result;