import axios from "axios";

const API_URL = "https://iptv-backend-w6hf.onrender.com"; // Tu backend desplegado

export const login = async (username, password) => {
  const deviceId = navigator.userAgent;
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    username,
    password,
    deviceId,
  });
  return response.data; // { token: "..." }
};

export const register = async (username, password) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, {
    username,
    password,
  });
  return response.data; // { message: "Usuario registrado correctamente" }
};
