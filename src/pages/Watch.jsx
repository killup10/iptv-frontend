// src/pages/Watch.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { getPlayableUrl } from "@/utils/playerUtils.js";
import axiosInstance from "@/utils/axiosInstance.js";

export function Watch() {
  const { itemType, itemId } = useParams();
  const location = useLocation(); // Para obtener el startTime si se pasa
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const M3U8_PROXY_BASE_URL = "https://stream.teamg.store";
  const startTime = location.state?.startTime || 0; // Obtener startTime de la navegación

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
        if (itemType === "channel") {
          endpoint = `/api/channels/id/${itemId}`;
          const response = await axiosInstance.get(endpoint);
          data = response.data;
        } else if (itemType === "movie" || itemType === "serie") {
          endpoint = `/api/videos/${itemId}`;
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
          tipo: data.tipo || itemType,
          // Asegúrate de pasar el ID único del item para guardar el progreso
          uniqueId: data._id || data.id, // Usaremos esto para el localStorage
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

  const finalPlayableUrl = getPlayableUrl(itemData, M3U8_PROXY_BASE_URL);

  return (
    <div className="bg-zinc-900 min-h-screen flex flex-col">
      {/* El padding superior se maneja con el espacio que deja el header fijo en App.jsx */}
      {/* Si tu header NO es fijo y quieres padding aquí, añade pt-16 o pt-20 */}
      <div className="container mx-auto px-2 sm:px-4 py-4 flex-grow flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md text-sm transition-colors"
          >
            ← Volver
          </button>
          {/* Podrías añadir un título aquí si quieres que esté fuera del área del reproductor */}
        </div>

        {/* Contenedor para centrar el reproductor y la info debajo */}
        <div className="flex-grow flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 px-2 sm:px-0 self-start w-full max-w-screen-xl">
            {itemData.name}
            {itemData.releaseYear && itemData.tipo !== 'channel' && <span className="text-gray-400 text-xl ml-2">({itemData.releaseYear})</span>}
          </h1>

          {/* Contenedor del reproductor con ancho máximo */}
          <div className="w-full max-w-screen-xl mb-6"> {/* Ajusta max-w-screen-xl según necesites */}
            {finalPlayableUrl ? (
              <VideoPlayer
                url={finalPlayableUrl}
                itemId={itemData.uniqueId} // Pasar el ID único para guardar progreso
                startTime={startTime} // Pasar el tiempo de inicio
              />
            ) : (
              <p className="text-orange-400 text-center py-10">La URL para este contenido no es válida o no se pudo procesar.</p>
            )}
          </div>

          {itemData.description && (
            <div className="p-4 bg-zinc-800 rounded-lg text-gray-300 max-w-screen-xl w-full">
              <h3 className="text-xl font-semibold text-white mb-2">Descripción</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{itemData.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Watch;
