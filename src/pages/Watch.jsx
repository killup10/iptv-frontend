// src/pages/Watch.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer.jsx"; // Asegúrate que este sea el del Canvas video_player_react_player_v2
import { useAuth } from "@/context/AuthContext.jsx";
import { getPlayableUrl } from "@/utils/playerUtils.js"; // Asegúrate que este sea el del Canvas player_utils_m3u8_proxy
import axiosInstance from "@/utils/axiosInstance.js";

export function Watch() {
  const { itemType, itemId } = useParams();
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  // const { user } = useAuth(); // No se usa directamente aquí si el token lo maneja axiosInstance

  // Define la URL base de tu proxy M3U8 de Cloudflare Worker
  const M3U8_PROXY_BASE_URL = "https://stream.teamg.store"; 

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!itemId || !itemType) { 
        setError("Falta información para cargar el contenido (tipo o ID)."); 
        setLoading(false); 
        return; 
      }
      setLoading(true); 
      setError(null);
      try {
        let data; 
        let endpoint = "";
        console.log(`Watch: Fetching ${itemType} con ID: ${itemId} usando axiosInstance.`);
        if (itemType === "channel") {
          endpoint = `/api/channels/id/${itemId}`; // Ruta relativa para axiosInstance
          const response = await axiosInstance.get(endpoint); 
          data = response.data;
        } else if (itemType === "movie" || itemType === "serie") {
          endpoint = `/api/videos/${itemId}`; // Ruta relativa para axiosInstance
          const response = await axiosInstance.get(endpoint); 
          data = response.data;
        } else { 
          setError(`Tipo de contenido "${itemType}" no reconocido.`); 
          setLoading(false); 
          return; 
        }
        if (!data) { 
          throw new Error("No se recibieron datos del backend."); 
        }
        const normalizedData = { 
            id: data._id || data.id, 
            name: data.name || data.title || data.titulo || "Contenido", 
            url: data.url, 
            description: data.description || data.descripcion || "", 
            releaseYear: data.releaseYear,
            tipo: data.tipo || itemType 
        };
        setItemData(normalizedData);
      } catch (err) { 
        console.error(`Error al cargar ${itemType} (ID: ${itemId}):`, err.response?.data || err.message); 
        setError(`No se pudo cargar el contenido. ${err.response?.data?.error || err.message || 'Error desconocido.'}`);
      } finally { 
        setLoading(false); 
      }
    };
    fetchItemDetails();
  }, [itemId, itemType]);

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-black"><div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="text-red-500 p-10 text-center min-h-screen bg-black pt-20">{error} <button onClick={() => navigate(-1)} className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded">Volver</button></div>;
  if (!itemData || !itemData.url) return <div className="text-white p-10 text-center min-h-screen bg-black pt-20">Contenido no encontrado o URL no disponible. <button onClick={() => navigate(-1)} className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded">Volver</button></div>;

  // Pasa la URL base del proxy M3U8 a getPlayableUrl
  const finalPlayableUrl = getPlayableUrl(itemData, M3U8_PROXY_BASE_URL); 

  return (
    <div className="p-4 bg-zinc-900 min-h-screen pt-20 flex flex-col"> 
      <div className="mb-4"> 
        <button 
          onClick={() => navigate(-1)} 
          className="text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md text-sm transition-colors" 
        > 
          ← Volver 
        </button> 
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 px-2 sm:px-0">
        {itemData.name} 
        {itemData.releaseYear && itemData.tipo !== 'channel' && <span className="text-gray-400 text-xl ml-2">({itemData.releaseYear})</span>}
      </h1>       
      <div className="flex-grow">
        {finalPlayableUrl ? (
          <VideoPlayer url={finalPlayableUrl} /> 
        ) : (
          <p className="text-orange-400 text-center py-10">La URL para este contenido no es válida o no se pudo procesar.</p>
        )}
      </div>
      {itemData.description && ( 
        <div className="mt-6 p-4 bg-zinc-800 rounded-lg text-gray-300 max-w-4xl w-full mx-auto"> 
          <h3 className="text-xl font-semibold text-white mb-2">Descripción</h3> 
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{itemData.description}</p> 
        </div> 
      )}
    </div>
  );
}
export default Watch;
