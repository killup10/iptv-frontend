// src/pages/Watch.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { getPlayableUrl } from "@/utils/playerUtils.js";
import axiosInstance from "@/utils/axiosInstance.js";

export function Watch() {
  const { itemType, itemId } = useParams();
  const location = useLocation();
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const M3U8_PROXY_BASE_URL = "https://stream.teamg.store";
  const startTime = location.state?.startTime || 0;

  console.log(`[Watch.jsx] Renderizando. itemType: ${itemType}, itemId: ${itemId}, startTime desde location.state: ${location.state?.startTime}`);

  useEffect(() => {
    console.log(`[Watch.jsx] useEffect ejecutándose. itemId: ${itemId}, itemType: ${itemType}, startTime (del estado del componente): ${startTime}`);
    const fetchItemDetails = async () => {
      if (!itemId || !itemType) {
        console.error("[Watch.jsx] Faltan itemId o itemType. No se puede hacer fetch.");
        setError("Falta información para cargar el contenido (tipo o ID).");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      console.log(`[Watch.jsx] Iniciando fetchItemDetails para itemId: ${itemId}, itemType: ${itemType}`);
      try {
        let data;
        let endpoint = "";
        if (itemType === "channel") {
          endpoint = `/api/channels/id/${itemId}`;
        } else if (itemType === "movie" || itemType === "serie") {
          endpoint = `/api/videos/${itemId}`;
        } else {
          console.error(`[Watch.jsx] Tipo de contenido "${itemType}" no reconocido.`);
          setError(`Tipo de contenido "${itemType}" no reconocido.`);
          setLoading(false);
          return;
        }
        
        console.log(`[Watch.jsx] Haciendo GET a endpoint: ${endpoint}`);
        const response = await axiosInstance.get(endpoint);
        data = response.data;
        console.log("[Watch.jsx] Datos recibidos del backend:", JSON.parse(JSON.stringify(data)));

        if (!data) {
          throw new Error("No se recibieron datos del backend para este item.");
        }
        const normalizedData = {
          id: data._id || data.id,
          name: data.name || data.title || data.titulo || "Contenido",
          url: data.url, // ¡MUY IMPORTANTE VERIFICAR ESTA URL!
          description: data.description || data.descripcion || "",
          releaseYear: data.releaseYear,
          tipo: data.tipo || itemType,
          uniqueId: data._id || data.id,
        };
        console.log("[Watch.jsx] Datos normalizados (itemData) listos para setear:", JSON.parse(JSON.stringify(normalizedData)));
        setItemData(normalizedData);
      } catch (err) {
        console.error(`[Watch.jsx] Error en fetchItemDetails para ${itemType} (ID: ${itemId}):`, err.response?.data || err.message, err);
        setError(`No se pudo cargar el contenido. ${err.response?.data?.error || err.message || 'Error desconocido.'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [itemId, itemType]); // startTime no debería estar aquí como dependencia directa para el fetch,
                           // ya que el item es el mismo, solo cambia el punto de inicio.

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-black"><div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  
  // Loguear itemData ANTES de verificar errores o URL
  // console.log("[Watch.jsx] Estado de itemData ANTES de la verificación de error/url:", itemData ? JSON.parse(JSON.stringify(itemData)) : null);

  if (error) {
    console.error("[Watch.jsx] Renderizando error:", error);
    return <div className="text-red-500 p-10 text-center min-h-screen bg-black pt-20">{error} <button onClick={() => navigate(-1)} className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded">Volver</button></div>;
  }
  
  if (!itemData) { // Si itemData es null después de cargar y sin error, es un caso raro.
    console.warn("[Watch.jsx] Renderizando: itemData es null pero no hay error ni loading.");
    return <div className="text-white p-10 text-center min-h-screen bg-black pt-20">Información del contenido no disponible. <button onClick={() => navigate(-1)} className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded">Volver</button></div>;
  }

  if (!itemData.url) {
    console.error("[Watch.jsx] Renderizando: itemData NO tiene URL.", JSON.parse(JSON.stringify(itemData)));
    return <div className="text-white p-10 text-center min-h-screen bg-black pt-20">URL del contenido no disponible. <button onClick={() => navigate(-1)} className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded">Volver</button></div>;
  }

  const finalPlayableUrl = getPlayableUrl(itemData, M3U8_PROXY_BASE_URL);
  console.log(`[Watch.jsx] finalPlayableUrl calculada para VideoPlayer: ${finalPlayableUrl}`);
  console.log(`[Watch.jsx] Props para VideoPlayer: url=${finalPlayableUrl}, itemId=${itemData.uniqueId}, startTime=${startTime}`);


  return (
    <div className="bg-zinc-900 min-h-screen flex flex-col">
      <div className="container mx-auto px-2 sm:px-4 py-4 flex-grow flex flex-col">
        <div className="mb-4 flex items-center justify-between w-full max-w-screen-xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm transition-colors"
          >
            ← Volver
          </button>
        </div>

        <div className="flex-grow flex flex-col items-center">
          <div className="w-full max-w-screen-xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 px-1 sm:px-0">
              {itemData.name}
              {itemData.releaseYear && itemData.tipo !== 'channel' && <span className="text-gray-300 text-lg sm:text-xl ml-2">({itemData.releaseYear})</span>}
            </h1>

            <div className="w-full mb-6">
              {finalPlayableUrl ? (
                <VideoPlayer
                  url={finalPlayableUrl}
                  itemId={itemData.uniqueId}
                  startTime={startTime}
                />
              ) : (
                <p className="text-orange-400 text-center py-10">La URL para este contenido no es válida o no se pudo procesar.</p>
              )}
            </div>
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
