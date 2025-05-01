const API_URL = "https://iptv-backend-w6hf.onrender.com";

async function login(username, password, deviceId) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password, deviceId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error en login: ${text}`);
  }

  const data = await response.json();
  return data;
}

async function register(username, password) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error en registro: ${text}`);
  }

  const data = await response.json();
  return data;
}

export { login, register };
