import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export function Catalogo({ type }) {
  const [contenido, setContenido] = useState([]);

  useEffect(() => {
    const fetchContenido = async () => {
      try {
        const res = await axios.get("/api/catalogo");
        const data = res.data;

        const filtered = type ? data.filter(item => item.tipo === type) : data;
        setContenido(filtered);
      } catch (error) {
        console.error("Error al cargar el catálogo:", error);
      }
    };

    fetchContenido();
  }, [type]);

  return (
    <div className="p-4 text-white">
      <h1 className="text-3xl font-bold mb-4">Catálogo de Contenido</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {contenido.map((item) => (
          <Link to={`/watch/${item._id}`} key={item._id}>
            <div className="bg-zinc-800 rounded-xl overflow-hidden shadow-md hover:scale-105 transition">
              <img src={item.thumbnail} alt={item.titulo} className="w-full h-48 object-cover" />
              <div className="p-2">
                <h2 className="text-lg font-semibold">{item.titulo}</h2>
                <p className="text-sm text-gray-400">{item.tipo}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Catalogo;
