import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const executeCode = async (payload) => {
  const { data } = await axios.post(`${API_URL}/api/code/execute`, payload);
  return data;
};