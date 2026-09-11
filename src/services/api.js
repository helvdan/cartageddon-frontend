import axios from 'axios';
import { toast } from 'react-hot-toast';

// Замени URL, если твой FastAPI запущен на другом порту (например, 8000)
const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const stageService = {

  getContext: async () => {
    const response = await api.get('/context');
    return response.data;
  },

  changeContext: async (value) => {
    const response = await api.post(`/context/change/`, {preset: value});
    return response.data;
  },

  getFiles: async (stageName) => {
    const response = await api.get(`/stages/${stageName}/`);
    return response.data;
  },

  deleteFiles: async (stageName) => {
    const response = await api.delete(`/stages/${stageName}/`);
    return response.data;
  },

  deleteArtifact: async (fileName) => {
    const response = await api.delete(`/artifacts/${fileName}/`);
    return response.data;
  },

  getArtifactContent: async (artifactName) => {
    const response = await api.get(`/artifacts/${artifactName}`);
    return response.data;
  },

  runPipeline: async () => {
    const response = await api.post(
      `/pipeline/run`,
      {},
      {validateStatus: (status) => status < 600}
    );

    if (response?.status !== 200) {
      toast.error(`Ошибка сервера: ${response.data.error}`, {
        duration: 5000,
        icon: null,
        style: {
          background: '#7f1d1d',
          color: '#fca5a5',
          border: '1px solid #f87171',
        }
      });
    }

    return response.data;
  },

  runStageWithArtifact: async (activeStage, selectedFile) => {
    const response = await api.post(
      `/pipeline/run/${activeStage}/${selectedFile}`,
      {},
      {validateStatus: (status) => status < 600}
    );

    if (response?.status !== 200) {
      toast.error(`Ошибка сервера: ${response.data.error}`, {
        duration: 5000,
        icon: null,
        style: {
          background: '#7f1d1d',
          color: '#fca5a5',
          border: '1px solid #f87171',
        }
      });
    }
    return response.data;
  }
};
