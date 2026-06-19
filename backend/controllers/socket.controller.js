import { saveMatchToDatabase } from './match.controller.js';

// In-memory store for active rooms
// In production, this could be moved to Redis for scalability
const activeRooms = new Map();

export const handleSocketConnection = (io, socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  // 1. Create a Room
  socket.on("create_room", ({ difficulty, matchType }) => {
    // Generate a 6-character uppercase room ID (e.g., A7X9P2)
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Initialize the room state
    activeRooms.set(roomId, {
      players: [socket.id], // The creator is player 1
      difficulty,
      matchType,
      status: "waiting"
    });

    socket.join(roomId);
    
    // Send the room code back to the creator
    socket.emit("room_created", { roomId });
    console.log(`🏠 Room created: ${roomId} (Type: ${matchType})`);

    // The 1-Minute Expiration Timer
    setTimeout(() => {
      const room = activeRooms.get(roomId);
      // If the room is still waiting for a second player after 60 seconds, kill it
      if (room && room.status === "waiting") {
        io.to(roomId).emit("room_expired", { message: "Room expired. No opponent joined." });
        io.in(roomId).socketsLeave(roomId); // Kick everyone out of the socket room
        activeRooms.delete(roomId); // Delete from memory
        console.log(`⏰ Room expired: ${roomId}`);
      }
    }, 60 * 1000); 
  });
// 2. Join a Room
  socket.on("join_room", ({ roomId }) => {
    const room = activeRooms.get(roomId);

    if (!room) {
      return socket.emit("room_error", { message: "Room not found or expired." });
    }

    if (room.status !== "waiting") {
      return socket.emit("room_error", { message: "Match already in progress." });
    }

    // Add player 2, update status, and join socket room
    room.players.push(socket.id);
    room.status = "active";
    socket.join(roomId);

    console.log(`⚔️ Match started in room: ${roomId}`);
    
    // Broadcast to BOTH players that the race has begun
    io.to(roomId).emit("match_started", { 
      roomId, 
      difficulty: room.difficulty,
      matchType: room.matchType
    });
  });

  // 3. Sync Player Progress (Real-time progress bar updates)
  socket.on("progress_update", ({ roomId, progress }) => {
    // socket.to() sends it to the opponent, but NOT back to the sender
    socket.to(roomId).emit("opponent_progress", { progress, playerId: socket.id });
  });

  // 4. Match Won (End Game Logic)
  // 4. Match Won (End Game Logic)
  socket.on("player_won", async ({ roomId }) => {
    const room = activeRooms.get(roomId);
    
    if (room && room.status === "active") {
      room.status = "finished";
      
      // Tell both players the match is over and who won
      io.to(roomId).emit("match_over", { winnerId: socket.id });
      
      // Save the result to Supabase!
      await saveMatchToDatabase(roomId, room.matchType, room.difficulty, socket.id);
      
      // Clean up the sockets and memory
      io.in(roomId).socketsLeave(roomId);
      activeRooms.delete(roomId);
      console.log(`🏆 Match finished in room: ${roomId}. Winner: ${socket.id}`);
    }
  });

  // Handle Disconnections
  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
    // We will add cleanup logic here later for when players drop mid-race
  });
};