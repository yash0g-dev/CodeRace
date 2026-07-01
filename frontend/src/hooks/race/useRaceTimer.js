import { useState, useEffect } from 'react';

export const useRaceTimer = (timeLimitMinutes, raceStarted, onTimeUp) => {
  const [countdown, setCountdown] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes === -1 ? -1 : timeLimitMinutes * 60);

  useEffect(() => {
    if (timeLeft === -1) return; // Do not tick if infinite

    let timerInterval;
    if (raceStarted && timeLeft > 0) {
      timerInterval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && raceStarted) {
      if (onTimeUp) onTimeUp();
    }
    return () => clearInterval(timerInterval);
  }, [raceStarted, timeLeft, onTimeUp]);

  const formatTime = (seconds) => {
    if (seconds === -1) return '∞'; // Infinity symbol
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return { countdown, setCountdown, timeLeft, formatTime };
};