import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = rawUrl.replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const getHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const getModelInfo = async () => {
  const response = await apiClient.get('/api/model-info');
  return response.data;
};

export const getDatasetInfo = async () => {
  const response = await apiClient.get('/api/dataset-info');
  return response.data;
};

export const getMetrics = async () => {
  const response = await apiClient.get('/api/metrics');
  return response.data;
};

export const getModelEvaluation = async () => {
  const response = await apiClient.get('/api/model-evaluation');
  return response.data;
};

export const getOverfittingAnalysis = async () => {
  const response = await apiClient.get('/api/overfitting');
  return response.data;
};

export const getCrossValidation = async () => {
  const response = await apiClient.get('/api/cross-validation');
  return response.data;
};

export const getModelComparison = async () => {
  const response = await apiClient.get('/api/model-comparison');
  return response.data;
};

export const getHyperparameterTuning = async () => {
  const response = await apiClient.get('/api/hyperparameter-tuning');
  return response.data;
};

export const getAdvancedModels = async () => {
  const response = await apiClient.get('/api/advanced-models');
  return response.data;
};

export const getRocCurve = async () => {
  const response = await apiClient.get('/api/roc-curve');
  return response.data;
};

export const getPrecisionRecall = async () => {
  const response = await apiClient.get('/api/precision-recall');
  return response.data;
};

export const getFinalModel = async () => {
  const response = await apiClient.get('/api/final-model');
  return response.data;
};

export const getFeatureOptions = async () => {
  const response = await apiClient.get('/api/feature-options');
  return response.data;
};

export const predictChurn = async (payload) => {
  const response = await apiClient.post('/api/predict', payload);
  return response.data;
};

export const retrainModel = async () => {
  const response = await apiClient.post('/api/retrain');
  return response.data;
};

export default apiClient;
