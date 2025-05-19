    // src/pages/Watch.jsx
    import React, { useState, useEffect } from "react";
    import { useParams, useNavigate } from "react-router-dom";
    import VideoPlayer from "../components/VideoPlayer.jsx";
    // Ya no necesitas importar axios directamente aquí si todas las llamadas API se hacen a través de api.js (que usa axiosInstance)
    // import axios from "axios"; 
    import { useAuth } from "@/context/AuthContext.jsx"; // Usando alias
    import { getPlayableUrl } from "@/utils/playerUtils.js"; // <--- IMPORTACIÓN NUEVA (usando alias)
    import { fetchChannelForPlayback, fetchUserMovies, fetchUserSeries } from "@/utils/api.js"; // Asumiendo que fetchUserMovies/Series pueden obtener un item por ID

    export function Watch() {
      const { itemType, itemId } = useParams();
      const [itemData, setItemData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const navigate = useNavigate();
      const { user } = useAuth(); // El token ya no se maneja aquí, axiosInstance lo hace

      useEffect(() => {
        const fetchItemDetails = async () => {
          if (!itemId || !itemType) {
            setError("Falta información para cargar el contenido (tipo o ID).");
            setLoading(false);
            return;
          }
          // El interceptor de axiosInstance ya maneja el token, no necesitas verificarlo aquí explícitamente
          // para la llamada API, pero sí para la lógica de acceso si es necesario.

          setLoading(true);
          setError(null);
          
          try {
            let data;
            console.log(`Watch: Fetching ${itemType} con ID: ${itemId}`);

            if (itemType === "channel") {
              data = await fetchChannelForPlayback(itemId);
            } else if (itemType === "movie") {
              // Necesitas una función en api.js para obtener UNA película por ID
              // Por ahora, asumiré que fetchUserMovies puede ser adaptada o crearás una nueva
              // Ejemplo conceptual: data = await fetchMovieById(itemId);
              // Si fetchUserMovies devuelve un array, necesitarías encontrar el item:
              // const movies = await fetchUserMovies(); data = movies.find(m => m.id === itemId);
              // Esto es ineficiente. Lo ideal es un endpoint /api/videos/:id
              // Por ahora, vamos a simular que obtienes el item.
              // La ruta GET /api/videos/:id en tu backend SÍ USA verifyToken.
              // axiosInstance se encargará de añadir el token.
              const response = await axiosInstance.get(`/api/videos/${itemId}`);
              data = response.data;

            } else if (itemType === "serie") {
              // Similar para series
              const response = await axiosInstance.get(`/api/videos/${itemId}`);
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
                name: data.name || data.title || data.titulo, 
                url: data.url, // La URL original del stream
                description: data.description || data.descripcion || "", 
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
      }, [itemId, itemType, user]); // user en dependencias por si el acceso cambia

      if (loading) return <div className="flex justify-center items-center min-h-screen bg-black"><div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
      if (error) return <div className="text-red-500 p-10 text-center min-h-screen bg-black pt-20">{error} <button onClick={() => navigate(-1)} className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded">Volver</button></div>;
      if (!itemData) return <div className="text-white p-10 text-center min-h-screen bg-black pt-20">Contenido no encontrado. <button onClick={() => navigate(-1)} className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded">Volver</button></div>;

      // Usa la función importada. Ya no necesita API_URL como argumento.
      const finalPlayableUrl = getPlayableUrl(itemData); 

      return (
        <div className="p-4 bg-zinc-900 min-h-screen pt-20"> 
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md text-sm transition-colors"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-white mb-4">{itemData.name}</h1> 
          
          {finalPlayableUrl ? (
            <VideoPlayer url={finalPlayableUrl} />
          ) : (
            <p className="text-orange-400 text-center py-10">La URL para este contenido no es válida o no se pudo procesar.</p>
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
    