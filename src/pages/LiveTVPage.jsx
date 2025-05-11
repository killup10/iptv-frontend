// src/pages/LiveTVPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Para obtener el token/usuario
import { fetchUserChannels } from '../utils/api.js'; // Asumiendo que esta función existe y es para usuarios logueados

export default function LiveTVPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [allChannels, setAllChannels] = useState([]); // Todos los canales cargados
  const [filteredChannels, setFilteredChannels] = useState([]); // Canales después de aplicar filtro de búsqueda y categoría
  const [categories, setCategories] = useState(['Todos']);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar canales cuando el componente se monta o el usuario cambia
  useEffect(() => {
    const loadData = async () => {
      if (!user?.token) {
        setError("Por favor, inicia sesión para ver los canales.");
        setIsLoading(false);
        setAllChannels([]); // Limpiar canales si no hay token
        setFilteredChannels([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const userChannelsData = await fetchUserChannels(); // Usa la función autenticada
        const channelsArray = userChannelsData || [];
        setAllChannels(channelsArray);
        setFilteredChannels(channelsArray); // Inicialmente mostrar todos
        
        // Extraer categorías únicas de los canales
        const uniqueCats = ['Todos', ...new Set(channelsArray.map(ch => ch.category).filter(Boolean).sort())];
        setCategories(uniqueCats);
        setActiveCategory('Todos'); // Resetear a 'Todos' al cargar nuevos canales

      } catch (err) {
        console.error("Error cargando canales en LiveTVPage:", err);
        setError(err.message || "No se pudieron cargar los canales.");
        setAllChannels([]);
        setFilteredChannels([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.token]); // Depende del token del usuario

  // Filtrar canales cuando cambia la categoría activa o el término de búsqueda
  useEffect(() => {
    let channelsToFilter = allChannels;

    if (activeCategory !== 'Todos') {
      channelsToFilter = channelsToFilter.filter(channel => channel.category === activeCategory);
    }

    if (searchTerm) {
      channelsToFilter = channelsToFilter.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredChannels(channelsToFilter);
  }, [activeCategory, searchTerm, allChannels]);

  const handleChannelClick = (channel) => {
    // Navegar a la página de reproducción. itemType es 'channel'
    navigate(`/watch/channel/${channel.id || channel._id}`);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Si no hay usuario (aunque ProtectedRoute debería manejar esto, es una doble seguridad)
  if (!user && !isLoading) { // Solo muestra si no está cargando y no hay usuario
      return <p className="text-center text-xl text-gray-400 mt-20">Debes <a href="/login" className="text-red-500 hover:underline">iniciar sesión</a> para ver el contenido.</p>;
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10 p-4 text-xl">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-0">TV en Vivo</h1>
        <input
          type="text"
          placeholder="Buscar canal..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:w-auto px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Selector de Categorías */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-300 mb-3">Categorías</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out
                          ${activeCategory === cat 
                              ? 'bg-red-600 text-white shadow-lg scale-105' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Canales Filtrados */}
      {filteredChannels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
          {filteredChannels.map(channel => (
            <div 
              key={channel.id || channel._id} 
              onClick={() => handleChannelClick(channel)} 
              className="cursor-pointer group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-video bg-black"> {/* Fondo negro para la imagen */}
                <img 
                    src={channel.thumbnail || channel.logo || '/img/placeholder-thumbnail.png'} // Ten un placeholder en public/img/
                    alt={channel.name || 'Canal'} 
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80" 
                    onError={(e) => {
                        e.currentTarget.onerror = null; // Prevenir bucles si el placeholder también falla
                        e.currentTarget.src = '/img/placeholder-thumbnail.png'; 
                    }}
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-100 truncate group-hover:text-red-400 transition-colors">
                    {channel.name || 'Canal sin nombre'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10 text-lg">
          {allChannels.length > 0 ? `No hay canales disponibles para la categoría "${activeCategory}" ${searchTerm ? `con el término "${searchTerm}"` : ''}.` : 'No hay canales cargados.'}
        </p>
      )}
    </div>
  );
}