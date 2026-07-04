import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "https://coderace-5xw6.onrender.com";

export const executeCode = async (payload) => {
  const { data } = await axios.post(`${API_URL}/api/code/execute`, payload);
  return data;
};