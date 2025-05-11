import { useState } from "react";
import axios from "axios";

const VideoForm = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [url, setUrl] = useState("");
  const [tipo, setTipo] = useState("movie");
  const [customThumbnail, setCustomThumbnail] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/videos", {
        titulo,
        descripcion,
        url,
        tipo,
        customThumbnail
      });

      setMensaje("✅ Video creado correctamente");
      setTitulo("");
      setDescripcion("");
      setUrl("");
      setTipo("movie");
      setCustomThumbnail("");
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

      <input
        type="url"
        placeholder="URL (Dropbox o m3u8)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        required
      />

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      >
        <option value="movie">🎬 Película</option>
        <option value="serie">📺 Serie</option>
        <option value="canal">📡 Canal en vivo</option>
      </select>

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
