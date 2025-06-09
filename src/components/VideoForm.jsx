import { useState } from "react";
import axios from "axios";

const VideoForm = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [url, setUrl] = useState("");
  const [tipo, setTipo] = useState("pelicula");
  const [subtipo, setSubtipo] = useState("serie");
  const [subcategoria, setSubcategoria] = useState("Netflix");
  const [customThumbnail, setCustomThumbnail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [chapters, setChapters] = useState([{ title: "", url: "" }]);

  const handleAddChapter = () => {
    setChapters([...chapters, { title: "", url: "" }]);
  };

  const handleChapterChange = (index, field, value) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  const handleRemoveChapter = (index) => {
    const newChapters = chapters.filter((_, i) => i !== index);
    setChapters(newChapters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const videoData = {
        titulo,
        descripcion,
        url,
        tipo,
        customThumbnail
      };

      if (tipo === "serie") {
        videoData.chapters = chapters;
        videoData.subtipo = subtipo;
        videoData.subcategoria = subcategoria;
        videoData.watchProgress = {
          lastChapter: 0,
          lastTime: 0,
          lastWatched: new Date(),
          completed: false
        };
      }

      const res = await axios.post("/api/videos", videoData);

      setMensaje("✅ Video creado correctamente");
      setTitulo("");
      setDescripcion("");
      setUrl("");
      setTipo("pelicula");
      setSubtipo("serie");
      setSubcategoria("Netflix");
      setCustomThumbnail("");
      setChapters([{ title: "", url: "" }]);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al crear el video");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-900 text-white rounded-xl max-w-xl mx-auto">
      <h2 className="text-xl font-bold">🎬 Nuevo Video</h2>

      <input
        type="text"
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        required
      />

      <textarea
        placeholder="Descripción (opcional)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      />

      {tipo === "pelicula" ? (
        <input
          type="url"
          placeholder="URL (Dropbox o m3u8)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required={tipo === "pelicula"}
        />
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold">Capítulos</h3>
          {chapters.map((chapter, index) => (
            <div key={index} className="space-y-2 p-3 border border-gray-700 rounded">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Capítulo {index + 1}</span>
                {chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveChapter(index)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Título del capítulo"
                value={chapter.title}
                onChange={(e) => handleChapterChange(index, "title", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                required
              />
              <input
                type="url"
                placeholder="URL del capítulo"
                value={chapter.url}
                onChange={(e) => handleChapterChange(index, "url", e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddChapter}
            className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            + Agregar Capítulo
          </button>
        </div>
      )}

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      >
        <option value="pelicula">🎬 Película</option>
        <option value="serie">📺 Serie/Anime/Dorama</option>
      </select>

      {tipo === "serie" && (
        <>
          <select
            value={subtipo}
            onChange={(e) => setSubtipo(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="serie">📺 Serie</option>
            <option value="anime">🎌 Anime</option>
            <option value="dorama">🎭 Dorama</option>
            <option value="novela">📖 Novela</option>
            <option value="documental">🎥 Documental</option>
          </select>

          <select
            value={subcategoria}
            onChange={(e) => setSubcategoria(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="Netflix">Netflix</option>
            <option value="Prime Video">Prime Video</option>
            <option value="Disney">Disney</option>
            <option value="Apple TV">Apple TV</option>
            <option value="Hulu y Otros">Hulu y Otros</option>
            <option value="Retro">Retro</option>
            <option value="Animadas">Animadas</option>
          </select>
        </>
      )}

      <input
        type="url"
        placeholder="Miniatura personalizada (opcional)"
        value={customThumbnail}
        onChange={(e) => setCustomThumbnail(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      />
      <p className="text-xs text-gray-400">Si no colocas una miniatura, se usará la de TMDB automáticamente.</p>

      <button type="submit" className="bg-pink-600 hover:bg-pink-700 w-full py-2 rounded text-white font-bold">
        Crear Video
      </button>

      {mensaje && <p className="text-sm text-center mt-2">{mensaje}</p>}
    </form>
  );
};

export default VideoForm;
