// src/services/AuthService.js
const API_URL = import.meta.env.VITE_API_URL;

export async function login(username, password, deviceId) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, deviceId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error en login");
  return data;
}

export async function register(username, password) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error en registro");
  return data;
}
