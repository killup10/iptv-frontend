// src/pages/Watch.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { useAuth } from "@/context/AuthContext.jsx"; // Usando alias
import { getPlayableUrl } from "@/utils/playerUtils.js"; // Usando alias
import axiosInstance from "@/utils/axiosInstance.js"; // <--- IMPORTACIÓN AÑADIDA (usando alias)

export function Watch() {
  const { itemType, itemId } = useParams();
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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
            throw new Error("No se recibieron datos para el contenido solicitado.");
        }

        const normalizedData = {
            id: data._id || data.id,
            name: data.name || data.title || data.titulo || "Contenido sin título", 
            url: data.url,
            description: data.description || data.descripcion || "", 
        };
        setItemData(normalizedData);

      } catch (err) {
        console.error(`Error al cargar ${itemType} (ID: ${itemId}):`, err.response?.data || err.message);
        // El interceptor de axiosInstance ya debería haber manejado 401/403 (deslogueo)
        // Aquí mostramos el error específico de esta petición si no fue de autenticación.
        setError(`No se pudo cargar el contenido. ${err.response?.data?.error || err.message || 'Error desconocido.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [itemId, itemType]); // Eliminado 'user' de las dependencias si el token lo maneja axiosInstance globalmente

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-black"><div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  
  // El error que se muestra aquí es el que establece el catch de fetchItemDetails
  if (error) return <div className="text-red-500 p-10 text-center min-h-screen bg-black pt-20">{error} <button onClick={() => navigate(-1)} className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded">Volver</button></div>;
  
  if (!itemData || !itemData.url) return <div className="text-white p-10 text-center min-h-screen bg-black pt-20">Contenido no encontrado o URL no disponible. <button onClick={() => navigate(-1)} className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded">Volver</button></div>;

  const finalPlayableUrl = getPlayableUrl(itemData); 

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
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 px-2 sm:px-0">{itemData.name}</h1> 
      
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
