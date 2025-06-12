import axiosInstance from '../utils/axiosInstance';

export const videoProgressService = {
  async getContinueWatching() {
    try {
      const response = await axiosInstance.get('/api/videos/user/continue-watching');
      return response.data;
    } catch (error) {
      console.error('[VideoProgress] Error obteniendo continuar viendo:', error);
      return [];
    }
  },
  async getProgress(videoId) {
    try {
      const response = await axiosInstance.get(`/api/videos/${videoId}/progress`);
      return response.data.watchProgress;
    } catch (error) {
      console.error('[VideoProgress] Error obteniendo progreso:', error);
      return null;
    }
  },

  async saveProgress(videoId, { lastTime, lastChapter, completed }) {
    try {
      const response = await axiosInstance.put(`/api/videos/${videoId}/progress`, {
        lastTime,
        lastChapter,
        completed
      });
      return response.data.watchProgress;
    } catch (error) {
      console.error('[VideoProgress] Error guardando progreso:', error);
      return null;
    }
  }
};
