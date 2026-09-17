import { create } from 'zustand';

const useMatchStore = create((set) => ({
  // Pre-game config
  roomId: null,
  difficulty: 'med',
  company: 'All',
  matchType: 'Blitz (15 min)',
  timeLimit: 15,
  isPractice: false,
  playerName: '',
  opponentName: null,
  
  // Post-game results
  didIWin: false,
  myCode: '',
  winnerCode: '',
  winnerLanguage: 'cpp',

  // Actions
  setGameConfig: (config) => set((state) => ({ ...state, ...config })),
  setMatchResult: (result) => set((state) => ({ ...state, ...result })),
  clearMatch: () => set({ roomId: null, opponentName: null, myCode: '', winnerCode: '' /* etc */ }),
}));

export default useMatchStore;
