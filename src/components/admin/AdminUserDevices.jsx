// components/admin/AdminUserDevices.jsx COMPLETO

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function AdminUserDevices({ userId, username }) {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/devices/admin/${userId}`);
      setDevices(res.data);
    } catch (err) {
      setError("Error al obtener dispositivos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (deviceId) => {
    try {
      await axiosInstance.delete(`/api/devices/admin/${userId}/${deviceId}`);
      setSuccess("Dispositivo desactivado.");
      fetchDevices();
    } catch (err) {
      setError("No se pudo desactivar el dispositivo.");
    }
  };

  useEffect(() => {
    if (user?.role === "admin" && userId) {
      fetchDevices();
    }
  }, [userId]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-6">
      <h3 className="text-xl font-bold text-red-500 mb-4">
        Dispositivos activos de {username}
      </h3>
      {error && <p className="text-red-400 mb-2">{error}</p>}
      {success && <p className="text-green-400 mb-2">{success}</p>}
      {loading ? (
        <p className="text-gray-300">Cargando...</p>
      ) : devices.length === 0 ? (
        <p className="text-gray-400">Este usuario no tiene dispositivos activos.</p>
      ) : (
        <ul className="divide-y divide-gray-600">
          {devices.map((device, index) => (
            <li
              key={device.deviceId || index}
              className="flex justify-between items-center py-2"
            >
              <div className="text-sm text-white">
                <p className="font-medium text-red-400">{device.deviceId}</p>
                <p className="text-xs text-gray-400">
                  Última conexión: {new Date(device.lastSeen).toLocaleString()}
                </p>
              </div>
              <Button
                onClick={() => handleDeactivate(device.deviceId)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 text-xs"
              >
                Desactivar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
