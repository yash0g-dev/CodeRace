import { declareWinner } from './match.controller.js';
import supabase from '../config/supabase.js';

const activeRooms = new Map();

export const handleSocketConnection = (io, socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  // --- 1. CREATE A ROOM ---
  socket.on("create_room", ({ difficulty, company, matchType, playerName }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    activeRooms.set(roomId, {
      settings: { difficulty, company, matchType },
      players: [{ id: socket.id, name: playerName, isReady: false, progress: 0, disconnected: false }],
      problem: null, 
      status: "waiting"
    });

    socket.join(roomId);
    socket.emit("room_created", { roomId });
    console.log(`🏠 Room created: ${roomId} by ${playerName} (Diff: ${difficulty}, Co: ${company}, Type: ${matchType})`);

    setTimeout(() => {
      const room = activeRooms.get(roomId);
      if (room && room.players.length === 1 && room.status === "waiting" && room.settings.matchType !== "practice") {
        io.to(roomId).emit("room_error", { message: "Room expired. No opponent joined." });
        io.in(roomId).socketsLeave(roomId);
        activeRooms.delete(roomId);
      }
    }, 5 * 60 * 1000); 
  });

  // --- 2. JOIN A ROOM ---
  socket.on("join_room", ({ roomId, playerName }) => {
    const room = activeRooms.get(roomId);

    if (!room) return socket.emit("room_error", { message: "Room not found or expired." });
    if (room.settings.matchType === 'practice') return socket.emit("room_error", { message: "Cannot join a practice room." });
    if (room.players.length >= 2) return socket.emit("room_error", { message: "Room is already full." });
    if (room.status !== "waiting") return socket.emit("room_error", { message: "Match already in progress." });

    room.players.push({ id: socket.id, name: playerName, isReady: false, progress: 0, disconnected: false });
    socket.join(roomId);

    socket.emit("room_joined", {
      roomId,
      creatorName: room.players[0].name,
      difficulty: room.settings.difficulty,
      company: room.settings.company,
      matchType: room.settings.matchType
    });

    socket.to(roomId).emit("player_joined", { joinerName: playerName });
    console.log(`⚔️ ${playerName} joined room ${roomId}`);
  });

  // --- 3. THE HANDSHAKE & PROBLEM FETCH ---
  socket.on("toggle_ready", async ({ roomId, isReady }) => {
    const room = activeRooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) player.isReady = isReady;

    io.to(roomId).emit("player_ready_status", { playerId: socket.id, isReady });

    const isPractice = room.settings.matchType === 'practice';
    const isReadyToStart = isPractice 
        ? (room.players.length === 1 && room.players[0].isReady)
        : (room.players.length === 2 && room.players.every(p => p.isReady));

    if (isReadyToStart && room.status === "waiting") {
      room.status = "active";
      console.log(`🏁 Match starting in ${roomId}. Fetching problem...`);

      try {
        const dbDiff = room.settings.difficulty === 'med' ? 'medium' : room.settings.difficulty;
        let query = supabase.from('problems').select('*').eq('difficulty', dbDiff).eq('available', true);

        if (room.settings.company !== 'All') {
          query = query.contains('companies', [room.settings.company.toLowerCase()]);
        }

        const { data: problems, error } = await query;
        if (error) throw error;

        const selectedProblem = (problems && problems.length > 0) ? problems[Math.floor(Math.random() * problems.length)] : null;

        if (!selectedProblem) {
            io.to(roomId).emit("room_error", { message: "No problem found matching those settings." });
            room.status = "waiting";
            room.players.forEach(p => p.isReady = false);
            io.to(roomId).emit("player_ready_status", { playerId: socket.id, isReady: false });
            return;
        }

        room.problem = selectedProblem;

        if (isPractice) {
          socket.emit("problem_data", selectedProblem);
          socket.emit("start_countdown", { seconds: 3 });
          console.log(`🎯 Practice match loaded instantly for room ${roomId}`);
        } else {
          io.to(roomId).emit("match_started", { roomId, difficulty: room.settings.difficulty, company: room.settings.company, matchType: room.settings.matchType });
          setTimeout(() => {
            io.to(roomId).emit("problem_data", selectedProblem);
            io.to(roomId).emit("start_countdown", { seconds: 3 });
          }, 1500);
        }

      } catch (err) {
        console.error("Database error fetching problem:", err.message);
        io.to(roomId).emit("room_error", { message: "Failed to load problem from database." });
      }
    }
  });

  // --- 4. REJOIN ROOM (REFRESH HANDSHAKE) ---
  socket.on("rejoin_room", ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (!room) return socket.emit("room_error", { message: "Room expired or closed." });

    // Find the disconnected player and assign the new socket.id to them
    const player = room.players.find(p => p.disconnected);
    if (player) {
      player.id = socket.id;
      player.disconnected = false;
    }

    socket.join(roomId);
    console.log(`🔄 Player reconnected to room ${roomId}`);

    // If the match was already active, resend the problem data and immediately clear the countdown
    if (room.status === "active" && room.problem) {
      socket.emit("problem_data", room.problem);
      socket.emit("start_countdown", { seconds: 0 }); // Instant GO!
    }
  });

  // --- 5. SYNC PLAYER PROGRESS ---
  socket.on("progress_update", ({ roomId, progress }) => {
    socket.to(roomId).emit("opponent_progress", { progress });
  });

  // --- 6. MATCH WON ---
  socket.on("player_won", async ({ roomId, executionTimeMs }) => {
    const room = activeRooms.get(roomId);
    
    if (room && room.status === "active") {
      room.status = "finished";
      io.to(roomId).emit("match_over", { winnerId: socket.id });
      
      try {
        const problemId = room.problem?.id || 'two-sum';
        const result = await declareWinner(roomId, socket.id, problemId, executionTimeMs || 0);
        if (result && result.success) console.log(`🏆 Match finalized! ELO Exchanged: +${result.pointsExchanged}`);
      } catch (dbError) {
        console.error("Failed to process V2 ELO engine transaction:", dbError.message);
      }
      
      io.in(roomId).socketsLeave(roomId);
      activeRooms.delete(roomId);
    }
  });

  // --- 7. SAFE CLEANUP (LEAVE & DISCONNECT) ---
  const handleLeave = (roomId, currentSocketId) => {
    const room = activeRooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === currentSocketId);
    if (playerIndex !== -1) {
      room.players.splice(playerIndex, 1);
      
      if (room.players.length === 0) {
        activeRooms.delete(roomId);
      } else {
        io.to(roomId).emit("opponent_left_handshake");
        room.players[0].isReady = false;
        room.status = "waiting";
      }
    }
  };

  socket.on("leave_room", ({ roomId }) => {
    handleLeave(roomId, socket.id);
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
    
    // Instead of instantly destroying the room, give a 10-second grace period for refresh reconnects
    for (const [roomId, room] of activeRooms.entries()) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.disconnected = true; // Mark as temporarily missing
        
        setTimeout(() => {
          const checkRoom = activeRooms.get(roomId);
          if (checkRoom) {
            const checkPlayer = checkRoom.players.find(p => p.id === socket.id && p.disconnected);
            if (checkPlayer) {
              handleLeave(roomId, socket.id); // Permanently boot them if they didn't rejoin
            }
          }
        }, 10000); 
      }
    }
  });
};