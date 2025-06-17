import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { fetchUserMovies, fetchMainMovieSections } from '@/utils/api.js';
import Card from '@/components/Card.jsx';
import MovieSectionCard from '@/components/MovieSectionCard.jsx';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

const getUniqueValuesFromArray = (items, field) => {
    if (!items || items.length === 0) return ['Todas'];
    const values = items.flatMap(item => {
        const fieldValue = item[field];
        if (Array.isArray(fieldValue)) return fieldValue;
        return fieldValue ? [fieldValue] : [];
    }).filter(Boolean);
    return ['Todas', ...new Set(values.sort((a,b) => a.localeCompare(b)))];
};

const isSectionAllowedForPlan = (sectionKey, userPlan) => {
    const restricciones = {
        "CINE_4K": ["cinefilo", "premium"],
        "CINE_60FPS": ["cinefilo", "premium"],
        "CINE_2025": ["cinefilo", "premium"],
        "TV_EN_VIVO": ["premium"],
        "DORAMAS": ["estandar", "cinefilo", "premium"]
    };
    if (!restricciones[sectionKey]) return true;
    return restricciones[sectionKey].includes(userPlan);
};

export default function MoviesPage() {
    const [specialEvents, setSpecialEvents] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allUserMovies, setAllUserMovies] = useState([]);
    const [mainSections, setMainSections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMainSectionKey, setSelectedMainSectionKey] = useState(null);
    const [genresForSelectedSection, setGenresForSelectedSection] = useState(['Todas']);
    const [selectedGenre, setSelectedGenre] = useState('Todas');
    const [searchTerm, setSearchTerm] = useState('');

    const shouldShowSpecialsSection = () => specialEvents.length > 0;
    const getSpecialEventName = () => specialEvents[0]?.specialEventName || "Especial";

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user?.token) {
                setError("Por favor, inicia sesión para acceder al contenido.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const [moviesData, sectionsDataFromAPI] = await Promise.all([
                    fetchUserMovies(),
                    fetchMainMovieSections()
                ]);
                setAllUserMovies(moviesData || []);
                let filteredSections = sectionsDataFromAPI || [];
                if (!shouldShowSpecialsSection()) {
                    filteredSections = filteredSections.filter(section => section.key !== "ESPECIALES");
                }
                setMainSections(filteredSections);
            } catch (err) {
                console.error("MoviesPage: Error cargando datos iniciales:", err);
                setError(err.message || "No se pudieron cargar los datos de películas.");
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [user?.token]);

    useEffect(() => {
        if (!selectedMainSectionKey || !allUserMovies.length) {
            setGenresForSelectedSection(['Todas']);
            setSelectedGenre('Todas');
            return;
        }
        const moviesForGenreExtraction = allUserMovies.filter(m =>
            selectedMainSectionKey === "POR_GENERO"
                ? m.mainSection === "POR_GENERO" || !m.mainSection
                : m.mainSection === selectedMainSectionKey
        );
        setGenresForSelectedSection(getUniqueValuesFromArray(moviesForGenreExtraction, 'genres'));
        setSelectedGenre('Todas');
        setSearchTerm('');
    }, [selectedMainSectionKey, allUserMovies]);

    const displayedMovies = useMemo(() => {
        let filtered = [...allUserMovies];
        if (selectedMainSectionKey) {
            filtered = filtered.filter(m =>
                selectedMainSectionKey === "POR_GENERO"
                    ? m.mainSection === "POR_GENERO" || !m.mainSection
                    : m.mainSection === selectedMainSectionKey
            );
        }
        if (selectedGenre !== 'Todas') {
            filtered = filtered.filter(m =>
                (Array.isArray(m.genres) && m.genres.map(g => g.toLowerCase()).includes(selectedGenre.toLowerCase())) ||
                (typeof m.genres === 'string' && m.genres.toLowerCase() === selectedGenre.toLowerCase())
            );
        }
        if (searchTerm) {
            filtered = filtered.filter(m =>
                (m.title && m.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return filtered;
    }, [allUserMovies, selectedMainSectionKey, selectedGenre, searchTerm]);

    const handleMovieClick = (movie) => {
        const movieId = movie.id || movie._id;
        if (!movieId) {
            console.error("MoviesPage: Clic en película sin ID válido.", movie);
            return;
        }
        navigate(`/watch/movie/${movieId}`);
    };

    const handleSelectMainSection = (sectionKey) => {
        const planUsuario = user?.plan || "gratuito";
        if (!isSectionAllowedForPlan(sectionKey, planUsuario)) {
            const requerido = sectionKey.includes("CINE") ? "Cinéfilo o Premium" : "un plan superior";
            setError(`🎬 Estimado cliente, debe tener el plan ${requerido} para acceder a esta sección.`);
            setTimeout(() => setError(null), 5000);
            return;
        }
        setSelectedMainSectionKey(sectionKey);
        setSelectedGenre('Todas');
        setSearchTerm('');
    };

    if (isLoading)
        return <div className="flex justify-center items-center min-h-[calc(100vh-128px)]"><div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-600"></div></div>;

    if (error)
        return <p className="text-center text-red-400 p-6 text-lg bg-gray-800 rounded-md mx-auto max-w-md">{error}</p>;

    if (!user)
        return <p className="text-center text-xl text-gray-400 mt-20">Debes <a href="/login" className="text-red-500 hover:underline">iniciar sesión</a> para ver este contenido.</p>;

    if (!selectedMainSectionKey) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center sm:text-left">Explorar Películas</h1>
                {mainSections.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {mainSections.map(section => {
                            if (section.key === "ESPECIALES" && !shouldShowSpecialsSection()) return null;
                            const sectionData = section.key === "ESPECIALES"
                                ? { ...section, displayName: getSpecialEventName() }
                                : section;
                            return (
                                <MovieSectionCard
                                    key={sectionData.key}
                                    section={sectionData}
                                    onClick={handleSelectMainSection}
                                    userPlan={user.plan || 'gratuito'}
                                    moviesInSection={[]} // ya no filtra por películas visibles
                                />
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-10 text-lg">No hay secciones de películas disponibles.</p>
                )}
            </div>
        );
    }

    const currentMainSection = mainSections.find(s => s.key === selectedMainSectionKey);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div className="flex items-center">
                    <button
                        onClick={() => { setSelectedMainSectionKey(null); setSearchTerm(''); }}
                        className="mr-3 text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                        title="Volver a Secciones"
                    >
                        <ChevronLeftIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                        {currentMainSection?.displayName || "Películas"}
                    </h1>
                </div>
                <input
                    type="text"
                    placeholder={`Buscar en ${selectedGenre === 'Todas' ? (currentMainSection?.displayName || "la sección") : selectedGenre}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 lg:w-1/4 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                />
            </div>

            {genresForSelectedSection.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-gray-700">
                    {genresForSelectedSection.map(genre => (
                        <button
                            key={genre}
                            onClick={() => setSelectedGenre(genre)}
                            className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ${selectedGenre === genre ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            )}

            {displayedMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {displayedMovies.map(movie => (
                        <Card
                            key={movie.id || movie._id}
                            item={movie}
                            onClick={() => handleMovieClick(movie)}
                            itemType="movie"
                            onPlayTrailer={(trailerUrl) => console.log("Intentando reproducir tráiler:", trailerUrl)}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400 mt-12 text-lg">
                    {`No se encontraron películas para "${selectedGenre}" en ${currentMainSection?.displayName || 'la sección actual'}.`}
                </p>
            )}
        </div>
    );
}
