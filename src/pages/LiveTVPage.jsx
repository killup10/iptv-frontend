// src/pages/LiveTVPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserChannels, fetchMainChannelSectionsForUser } from '../utils/api.js';
import MainSectionCard from '../components/MainSectionCard.jsx';
import Card from '../components/Card.jsx';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

const getUniqueValuesFromArray = (items, field) => {
    if (!items || items.length === 0) return ['Todos'];
    const values = items.flatMap(item => item[field] || []).filter(Boolean);
    return ['Todos', ...new Set(values.sort((a,b) => a.localeCompare(b)))];
};

export default function LiveTVPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allUserChannels, setAllUserChannels] = useState([]);
  const [mainChannelSections, setMainChannelSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMainSectionKey, setSelectedMainSectionKey] = useState(null);
  const [categoriesForFilter, setCategoriesForFilter] = useState(['Todos']); // Categorías para el dropdown de filtro DENTRO de una sección
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('Todos'); // Categoría de filtro seleccionada
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.token) {
        setError("Por favor, inicia sesión para acceder a los canales.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const [channelsData, sectionsData] = await Promise.all([
          fetchUserChannels(), 
          fetchMainChannelSectionsForUser() 
        ]);
        setAllUserChannels(channelsData || []);
        setMainChannelSections(sectionsData || []);
      } catch (err) {
        console.error("LiveTVPage: Error cargando datos iniciales:", err);
        setError(err.message || "No se pudieron cargar los datos de TV en vivo.");
        setAllUserChannels([]);
        setMainChannelSections([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [user?.token]);

  useEffect(() => {
    if (!selectedMainSectionKey || !allUserChannels.length) {
      setCategoriesForFilter(['Todos']);
      setSelectedFilterCategory('Todos');
      return;
    }

    const currentSection = mainChannelSections.find(s => s.key === selectedMainSectionKey);
    if (!currentSection || !currentSection.categoriesIncluded) {
      setCategoriesForFilter(['Todos']);
      setSelectedFilterCategory('Todos');
      return;
    }
    
    const channelsInThisMainSection = allUserChannels.filter(channel => 
      currentSection.categoriesIncluded.includes(channel.category)
    );
    
    setCategoriesForFilter(getUniqueValuesFromArray(channelsInThisMainSection, 'category'));
    setSelectedFilterCategory('Todos');
    setSearchTerm('');

  }, [selectedMainSectionKey, allUserChannels, mainChannelSections]);

  const displayedChannels = useMemo(() => {
    if (!selectedMainSectionKey && mainChannelSections.length > 0 && !isLoading) return []; 
    
    let filtered = allUserChannels;
    const currentSection = mainChannelSections.find(s => s.key === selectedMainSectionKey);

    if (currentSection && currentSection.categoriesIncluded) {
        filtered = filtered.filter(channel => 
            currentSection.categoriesIncluded.includes(channel.category)
        );
    } else if (selectedMainSectionKey === "ALL_CHANNELS_VIEW") { // Ejemplo de clave para "ver todos"
        // No aplicar filtro de sección principal si es "ver todos"
    } else if (selectedMainSectionKey) { // Si se seleccionó una sección no encontrada o sin categoriesIncluded
        // return []; // O mostrar mensaje de sección no válida
    }


    if (selectedFilterCategory !== 'Todos') {
      filtered = filtered.filter(ch => ch.category === selectedFilterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(ch => 
        ch.name && ch.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [allUserChannels, mainChannelSections, selectedMainSectionKey, selectedFilterCategory, searchTerm, isLoading]);

  const handleChannelClick = (channel) => {
    const channelId = channel.id || channel._id;
    if (!channelId) return; 
    navigate(`/watch/channel/${channelId}`);
  };
  
  const handleSelectMainSection = (sectionKey) => {
    setSelectedMainSectionKey(sectionKey);
    setSelectedFilterCategory('Todos'); 
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[calc(100vh-128px)]"><div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <p className="text-center text-red-400 p-6 text-lg bg-gray-800 rounded-md mx-auto max-w-md">{error}</p>;
  if (!user) return <p className="text-center text-xl text-gray-400 mt-20">Debes <a href="/login" className="text-red-500 hover:underline">iniciar sesión</a> para ver este contenido.</p>;

  if (!selectedMainSectionKey) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center sm:text-left">
          Explorar TV en Vivo
        </h1>
        {mainChannelSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {mainChannelSections.map(section => (
              <MainSectionCard 
                key={section.key} 
                section={section} 
                onClick={handleSelectMainSection}
                userPlan={user.plan || 'gplay'}
                // Para miniaturas, MainSectionCard debe poder usar section.thumbnailSample
                // o podrías pasarle una lista de canales de esa sección para que rote logos
                moviesInSection={allUserChannels.filter(c => section.categoriesIncluded?.includes(c.category)).slice(0, 10)}
              />
            ))}
            {/* Opcional: Botón para ver todos los canales sin filtrar por sección principal */}
            {/* <div 
              onClick={() => handleSelectMainSection("ALL_CHANNELS_VIEW")}
              className="bg-gray-700 p-6 rounded-xl text-center text-white font-semibold hover:bg-gray-600 cursor-pointer transition"
            >
              Ver Todos los Canales ({allUserChannels.length})
            </div> */}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10 text-lg">No hay secciones de TV en vivo disponibles o no se pudieron cargar.</p>
        )}
      </div>
    );
  }

  const currentMainSectionDetails = mainChannelSections.find(s => s.key === selectedMainSectionKey) || 
                                   (selectedMainSectionKey === "ALL_CHANNELS_VIEW" ? { displayName: "Todos los Canales" } : null);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => { setSelectedMainSectionKey(null); setSearchTerm(''); }} 
            className="mr-3 text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="Volver a Secciones"
          >
            <ChevronLeftIcon className="w-6 h-6 sm:w-7 sm:w-7" />
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
            {currentMainSectionDetails?.displayName || "Canales"}
          </h1>
        </div>
        <input
            type="text"
            placeholder={`Buscar en ${selectedFilterCategory === 'Todos' ? (currentMainSectionDetails?.displayName || "la sección") : selectedFilterCategory}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 lg:w-1/4 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
        />
      </div>
      
      {categoriesForFilter.length > 1 && selectedMainSectionKey !== "ALL_CHANNELS_VIEW" && (
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-gray-700">
          {categoriesForFilter.map(category => (
            <button
              key={category}
              onClick={() => setSelectedFilterCategory(category)}
              className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150
                          ${selectedFilterCategory === category 
                              ? 'bg-red-600 text-white shadow-lg' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {displayedChannels.length > 0 ? (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
          {displayedChannels.map(channel => (
            <Card
              key={channel.id || channel._id}
              item={{ 
                  id: channel.id || channel._id,
                  name: channel.name,
                  title: channel.name,
                  thumbnail: channel.thumbnail || channel.logo || '/img/placeholder-thumbnail.png',
                  category: channel.category,
              }}
              onClick={() => handleChannelClick(channel)}
              itemType="channel"
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-12 text-lg">
          {searchTerm && `No se encontraron canales para "${searchTerm}".`}
          {!searchTerm && (selectedFilterCategory !== 'Todos') && `No se encontraron canales para la categoría "${selectedFilterCategory}".`}
          {!searchTerm && (selectedFilterCategory === 'Todos') && `No hay canales en ${currentMainSectionDetails?.displayName || 'la sección actual'}.`}
        </p>
      )}
    </div>
  );
}