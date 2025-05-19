// src/pages/Watch.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate para el botón "Volver"
import VideoPlayer from "../components/VideoPlayer.jsx";
import axios from "axios"; // Mantienes axios, está bien
import { useAuth } from "../context/AuthContext.jsx";

// --- INICIO: Lógica de getPlayableUrl ---
// ¡IDEALMENTE, MUEVE ESTO A UN ARCHIVO UTILS (ej. src/utils/playerUtils.js) E IMPÓRTALO!
function getPlayableUrl(originalUrl, API_URL_FOR_PROXY) {
  if (!originalUrl) {
    console.warn("Watch/getPlayableUrl: URL original es nula o undefined");
    return originalUrl;
  }
  console.log("Watch/getPlayableUrl: evaluando originalUrl:", originalUrl);

  const url = originalUrl.trim();

  // 1) Si la URL contiene ".m3u8" en cualquier parte, devolvemos la URL completa
  //    (sin pasar por proxy). Así, cualquier HLS se reproduce directamente.
  if (url.toLowerCase().includes(".m3u8")) {
    console.log(`    সিদ্ধান্ত: Reproduciendo directamente (HLS .m3u8): ${url}`);
    return url;
  }

  // 2) Si la URL es un enlace a teamg.store o tu proxy inverso, la devolvemos sin cambios:
  if (url.startsWith("https://teamg.store/")) {
    console.log(`    সিদ্ধান্ত: Reproduciendo directamente (URL de teamg.store): ${url}`);
    return url;
  }
  if (url.startsWith("https://live-evg25.tv360.bitel.com.pe/")) {
    console.log(`  TEST: Reproduciendo directamente URL de Bitel (sin proxy Node.js): ${url}`);
    return url;
  }
  if (url.startsWith("http://179.51.136.19")) {
    console.log(`  TEST: Reproduciendo directamente URL de 179.51.136.19 (sin proxy Node.js): ${url}`);
    return url;
  }

  // 3) Si la URL contiene "dropbox.com", quitamos todo lo que venga después de '?'
  //    y devolvemos la parte cruda (ej. https://dl.dropboxusercontent.com/.../archivo.mp4)
  if (url.toLowerCase().includes("dropbox.com")) {
    const [withoutQuery] = url.split("?");
    console.log(`    সিদ্ধান্ত: Reproduciendo directamente (Dropbox sin parámetros): ${withoutQuery}`);
    return withoutQuery;
  }

  // 4) Si la URL termina en .mp4 o .mkv (pero no .m3u8), la reproducimos vía proxy:
  //    Enviamos el endpoint al backend, que actuará como proxy para evitar CORS, etc.
  if (url.match(/\.(mp4|mkv)(\?|$)/i)) {
    const encodedUrl = encodeURIComponent(url);
    // Asegúrate que API_URL_FOR_PROXY no tenga barra al final si /proxy ya la tiene implícita
    const proxiedUrl = `${API_URL_FOR_PROXY}/proxy?url=${encodedUrl}`;
    console.log(`   সিদ্ধান্ত: Reproduciendo vía proxy del backend Node.js: ${proxiedUrl} (Original: ${url})`);
    return proxiedUrl;
  }

  // 5) En cualquier otro caso (sin .m3u8, sin dropbox, sin mp4/mkv), devolvemos la URL sin cambios.
  console.log(`   সিদ্ধান্ত: Reproduciendo directamente (otro tipo de URL): ${url}`);
  return url;
}
// --- FIN: Lógica de getPlayableUrl ---

export function Watch() {
  const { itemType, itemId } = useParams(); 
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Para el botón "Volver"

  const { user } = useAuth();
  const token = user?.token || localStorage.getItem("token"); 

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchItemData = async () => {
      if (!itemId || !itemType) {
        setError("Falta información para cargar el contenido (tipo o ID).");
        setLoading(false);
        return;
      }
      if (!token) {
        setError("No autenticado. Por favor, inicia sesión.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      let endpoint = "";

      if (itemType === "channel") {
        endpoint = `${API_URL}/api/channels/id/${itemId}`;
      } else if (itemType === "movie" || itemType === "serie") {
        endpoint = `${API_URL}/api/videos/${itemId}`;
      } else {
        setError(`Tipo de contenido "${itemType}" no reconocido.`);
        setLoading(false);
        return;
      }

      console.log(`Watch: Fetching ${itemType} desde ${endpoint}`);

      try {
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        const normalizedData = {
          id: data._id || data.id,
          name: data.name || data.title || data.titulo,
          url: data.url,
          description: data.description || data.descripcion || "",
        };
        setItemData(normalizedData);
      } catch (err) {
        console.error(
          `Error al cargar ${itemType} (ID: ${itemId}):`,
          err.response?.data || err.message
        );
        setError(
          `No se pudo cargar el contenido. ${err.response?.data?.error || "Error desconocido."}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [itemId, itemType, token, API_URL]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 p-10 text-center min-h-screen bg-black pt-20">
        {error}{" "}
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded text-white"
        >
          Volver
        </button>
      </div>
    );

  if (!itemData)
    return (
      <div className="text-white p-10 text-center min-h-screen bg-black pt-20">
        Contenido no encontrado.{" "}
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded text-white"
        >
          Volver
        </button>
      </div>
    );

  const playableUrl = getPlayableUrl(itemData.url, API_URL);

  return (
    <div className="p-4 bg-zinc-900 min-h-screen pt-20">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md text-sm transition-colors"
      >
        ← Volver
      </button>
      <h1 className="text-3xl font-bold text-white mb-4">{itemData.name}</h1>

      {playableUrl ? (
        <VideoPlayer url={playableUrl} />
      ) : (
        <p className="text-orange-400 text-center py-10">
          La URL para este contenido no es válida o no se pudo procesar.
        </p>
      )}

      {itemData.description && (
        <div className="mt-6 p-4 bg-zinc-800 rounded-lg text-gray-300">
          <h3 className="text-xl font-semibold text-white mb-2">Descripción</h3>
          <p className="text-sm leading-relaxed">{itemData.description}</p>
        </div>
      )}
    </div>
  );
}

export default Watch;
