import { useState, useEffect } from "react";
import axios from "axios";

const SeriesManager = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSeries, setEditingSeries] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSeries = async () => {
    try {
      // Fetch series
      const seriesResponse = await axios.get("/api/videos", {
        params: {
          view: 'admin',
          tipo: "serie",
          limit: 100
        }
      });
      
      // Fetch anime
      const animeResponse = await axios.get("/api/videos", {
        params: {
          view: 'admin',
          tipo: "anime",
          limit: 100
        }
      });
      
      // Combine both results
      const allSeries = [
        ...(seriesResponse.data.videos || []),
        ...(animeResponse.data.videos || [])
      ];
      
      setSeries(allSeries);
    } catch (err) {
      console.error("Error fetching series:", err);
      setError("Error al cargar las series");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const handleUpdateSeries = async (seriesData) => {
    try {
      await axios.put(`/api/videos/${seriesData._id}`, seriesData);
      setEditingSeries(null);
      fetchSeries();
    } catch (err) {
      console.error("Error updating series:", err);
      setError("Error al actualizar la serie");
    }
  };

  const filteredSeries = series.filter(serie => 
    serie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-4">Cargando series...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestionar Series</h2>
        <input
          type="text"
          placeholder="Buscar series..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      <div className="grid gap-4">
        {filteredSeries.map((serie) => (
          <div key={serie._id} className="bg-gray-800 p-4 rounded-lg">
            {editingSeries?._id === serie._id ? (
              <SeriesEditor
                series={serie}
                onSave={handleUpdateSeries}
                onCancel={() => setEditingSeries(null)}
              />
            ) : (
              <SeriesPreview
                series={serie}
                onEdit={() => setEditingSeries(serie)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SeriesPreview = ({ series, onEdit }) => (
  <div className="flex justify-between items-start">
    <div>
      <h3 className="font-semibold">{series.title}</h3>
      <p className="text-sm text-gray-400">
        {series.tipo === 'anime' ? '🎌 Anime' : '📺 Serie'} • 
        {series.chapters?.length || 0} capítulos
      </p>
    </div>
    <button
      onClick={onEdit}
      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
    >
      Editar
    </button>
  </div>
);

const SeriesEditor = ({ series, onSave, onCancel }) => {
  const [editedSeries, setEditedSeries] = useState(series);

  const handleChapterChange = (index, field, value) => {
    const newChapters = [...editedSeries.chapters];
    newChapters[index][field] = value;
    setEditedSeries({ ...editedSeries, chapters: newChapters });
  };

  const handleAddChapter = () => {
    setEditedSeries({
      ...editedSeries,
      chapters: [
        ...editedSeries.chapters,
        { title: `Capítulo ${editedSeries.chapters.length + 1}`, url: "" }
      ]
    });
  };

  const handleRemoveChapter = (index) => {
    setEditedSeries({
      ...editedSeries,
      chapters: editedSeries.chapters.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          value={editedSeries.title}
          onChange={(e) => setEditedSeries({ ...editedSeries, title: e.target.value })}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        />
        <select
          value={editedSeries.tipo}
          onChange={(e) => setEditedSeries({ ...editedSeries, tipo: e.target.value })}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        >
          <option value="serie">📺 Serie</option>
          <option value="anime">🎌 Anime</option>
          <option value="dorama">🎭 Dorama</option>
          <option value="novela">📖 Novela</option>
          <option value="documental">🎥 Documental</option>
        </select>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Capítulos</h4>
        {editedSeries.chapters.map((chapter, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={chapter.title}
              onChange={(e) => handleChapterChange(index, "title", e.target.value)}
              className="flex-1 p-2 rounded bg-gray-700 border border-gray-600"
              placeholder="Título del capítulo"
            />
            <input
              type="text"
              value={chapter.url}
              onChange={(e) => handleChapterChange(index, "url", e.target.value)}
              className="flex-2 p-2 rounded bg-gray-700 border border-gray-600"
              placeholder="URL del capítulo"
            />
            <button
              onClick={() => handleRemoveChapter(index)}
              className="text-red-500 hover:text-red-400 px-2"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddChapter}
          className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          + Agregar Capítulo
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave(editedSeries)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default SeriesManager;
