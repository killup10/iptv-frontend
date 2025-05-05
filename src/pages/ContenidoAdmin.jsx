// src/pages/ContenidoAdmin.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function ContenidoAdmin() {
  const { user } = useAuth();
  const [canal, setCanal] = useState({ name: "", url: "" });
  const [vod, setVod] = useState({ title: "", url: "" });
  const [canales, setCanales] = useState([]);
  const [vods, setVods] = useState([]);
  const API = import.meta.env.VITE_API_URL;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const cargarContenido = async () => {
    const [c, v] = await Promise.all([
      fetch(`${API}/api/m3u`).then(res => res.json()),
      fetch(`${API}/api/videos`).then(res => res.json()),
    ]);
    setCanales(c || []);
    setVods(v || []);
  };

  useEffect(() => {
    if (user?.role === "admin") cargarContenido();
  }, [user]);

  const agregarCanal = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/api/m3u/manual`, {
      method: "POST",
      headers,
      body: JSON.stringify(canal),
    });
    if (res.ok) {
      setCanal({ name: "", url: "" });
      cargarContenido();
    }
  };

  const agregarVOD = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/api/videos`, {
      method: "POST",
      headers,
      body: JSON.stringify(vod),
    });
    if (res.ok) {
      setVod({ title: "", url: "" });
      cargarContenido();
    }
  };

  if (user?.role !== "admin") return <p>No autorizado</p>;

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Panel de Contenido</h1>

      {/* Formulario canal */}
      <form onSubmit={agregarCanal} className="space-y-2">
        <h2 className="text-xl font-semibold">Agregar canal M3U</h2>
        <Input placeholder="Nombre del canal" value={canal.name} onChange={e => setCanal({ ...canal, name: e.target.value })} />
        <Input placeholder="URL .m3u8" value={canal.url} onChange={e => setCanal({ ...canal, url: e.target.value })} />
        <Button type="submit">Agregar canal</Button>
      </form>

      {/* Formulario VOD */}
      <form onSubmit={agregarVOD} className="space-y-2">
        <h2 className="text-xl font-semibold">Agregar VOD (Dropbox)</h2>
        <Input placeholder="Título del video" value={vod.title} onChange={e => setVod({ ...vod, title: e.target.value })} />
        <Input placeholder="URL de Dropbox (.mp4/.mkv)" value={vod.url} onChange={e => setVod({ ...vod, url: e.target.value })} />
        <Button type="submit">Agregar VOD</Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        <div>
          <h3 className="font-semibold text-lg">Canales Agregados</h3>
          <ul className="space-y-1">
            {canales.map((c, i) => (
              <li key={i} className="border p-2 rounded bg-white shadow">{c.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg">VOD Agregados</h3>
          <ul className="space-y-1">
            {vods.map((v, i) => (
              <li key={i} className="border p-2 rounded bg-white shadow">{v.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
