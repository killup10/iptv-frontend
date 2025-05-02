const API_URL = import.meta.env.VITE_API_URL;

// Función de login que retorna token y role
export async function login(username, password, deviceId) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, deviceId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error en login");
  // Ahora devolvemos objeto con token y role
  return { token: data.token, role: data.role };
}

// Función de registro (sin cambios)
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
``` Componente `Login.jsx`

**Ruta:** `iptv-frontend/src/pages/Login.jsx`

Solo modifica el handler `handleLogin` para capturar y guardar `role`:

```diff
-      const { token } = await loginService(username, password, deviceId);
-      localStorage.setItem("token", token);
-      login({ username, token });
+      const { token, role } = await loginService(username, password, deviceId);
+      localStorage.setItem("token", token);
+      login({ username, token, role });