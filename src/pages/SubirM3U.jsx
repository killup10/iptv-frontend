import React, { useState } from "react";
import axios from "axios";

function SubirM3U() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setStatus("Selecciona un archivo .m3u");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://iptv-backend-w6hf.onrender.com/api/videos/upload-m3u",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setStatus(`✅ Subido correctamente: ${res.data.entries.length} entradas`);
    } catch (error) {
      setStatus("❌ Error al subir archivo");
      console.error(error);
    }
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">Subir archivo M3U</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input
          type="file"
          accept=".m3u"
          onChange={(e) => setFile(e.target.files[0])}
          className="bg-zinc-800 p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
          Subir
        </button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}

export default SubirM3U;
