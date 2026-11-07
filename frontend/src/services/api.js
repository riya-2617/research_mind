import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPapers = () => api.get('/papers').then(res => res.data);
export const getPaperById = (id) => api.get(`/papers/${id}`).then(res => res.data);
export const uploadPapers = (formData) => api.post('/papers/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);
export const deletePaper = (id) => api.delete(`/papers/${id}`).then(res => res.data);
export const loadSamplePapers = () => api.post('/papers/load_samples').then(res => res.data);

// Paper Addition Capabilities
export const getPaperCatalog = () => api.get('/papers/catalog').then(res => res.data);
export const addCatalogPaper = (catalogId) => api.post(`/papers/catalog/${catalogId}`).then(res => res.data);
export const addCustomPaper = (data) => api.post('/papers/custom', data).then(res => res.data);
export const addArxivPaper = (query) => api.post('/papers/arxiv', { query }).then(res => res.data);

// Multimodal Visual Figures & Diagrams
export const getAllFigures = () => api.get('/figures').then(res => res.data);
export const getPaperFigures = (paperId) => api.get(`/figures/paper/${paperId}`).then(res => res.data);

export const askRag = (query, paperId = null, topK = 5) => 
  api.post('/rag/ask', { query, paper_id: paperId, top_k: topK }).then(res => res.data);

// Multimodal Agent Chat (supports text + optional image)
export const chatWithAgent = (query, paperId = null, imageData = null, mimeType = "image/png") => 
  api.post('/agent/chat', { 
    query, 
    paper_id: paperId,
    image_data: imageData,
    mime_type: mimeType
  }).then(res => res.data);

export const comparePapers = (paperIds, criteria = null) => 
  api.post('/compare', { paper_ids: paperIds, criteria }).then(res => res.data);

export const analyzeGaps = (paperIds = null, topic = null) => 
  api.post('/gaps', { paper_ids: paperIds, topic }).then(res => res.data);

export const generateLiteratureReview = (paperIds = null, focusArea = null) => 
  api.post('/review', { paper_ids: paperIds, focus_area: focusArea }).then(res => res.data);

export const getSettingsStatus = () => api.get('/settings/status').then(res => res.data);
export const updateSettings = (data) => api.post('/settings/update', data).then(res => res.data);

export default api;
