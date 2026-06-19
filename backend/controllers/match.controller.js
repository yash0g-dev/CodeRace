import { supabase } from '../config/supabase.js';

export const saveMatchToDatabase = async (roomId, matchType, difficulty, winnerId) => {
  try {
    const { data, error } = await supabase
      .from('match_history')
      .insert([
        {
          room_id: roomId,
          match_type: matchType,
          difficulty: difficulty,
          winner_id: winnerId
        }
      ]);

    if (error) {
      console.error("❌ Error saving match to Supabase:", error.message);
      return false;
    }

    console.log(`💾 Match ${roomId} successfully saved to database!`);
    return true;
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    return false;
  }
};