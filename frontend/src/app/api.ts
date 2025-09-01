/**
 * API client configuration and methods
 */

import axios, { AxiosResponse } from 'axios';
import type {
  RecommendationRequest,
  RecommendationResponse,
  FeedbackRequest,
  FeedbackResponse,
  HealthResponse,
  MetadataResponse,
  SimilarItemsResponse,
  QuickSuggestionsResponse,
  ApiError,
} from '@/lib/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7017',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers or request modifications here
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Transform error to our ApiError type
    const apiError: ApiError = {
      message: error.response?.data?.detail || error.message || 'An error occurred',
      status: error.response?.status,
      code: error.code,
    };
    
    return Promise.reject(apiError);
  }
);

// API methods
export const apiClient = {
  // Health check
  async getHealth(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await api.get('/api/health');
    return response.data;
  },

  // Get system metadata
  async getMetadata(): Promise<MetadataResponse> {
    const response: AxiosResponse<MetadataResponse> = await api.get('/api/metadata');
    return response.data;
  },

  // Get recommendations
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const response: AxiosResponse<RecommendationResponse> = await api.post('/api/recommend', request);
    return response.data;
  },

  // Submit feedback
  async submitFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
    const response: AxiosResponse<FeedbackResponse> = await api.post('/api/feedback', request);
    return response.data;
  },

  // Get similar items
  async getSimilarItems(itemId: string, limit: number = 5): Promise<SimilarItemsResponse> {
    const response: AxiosResponse<SimilarItemsResponse> = await api.get(
      `/api/similar/${itemId}?limit=${limit}`
    );
    return response.data;
  },

  // Get quick suggestions
  async getQuickSuggestions(
    availableMinutes: number,
    domain?: string
  ): Promise<QuickSuggestionsResponse> {
    const params = new URLSearchParams({ available_minutes: availableMinutes.toString() });
    if (domain) {
      params.append('domain', domain);
    }
    
    const response: AxiosResponse<QuickSuggestionsResponse> = await api.get(
      `/api/quick-suggestions?${params.toString()}`
    );
    return response.data;
  },
};

// Utility function to check if API is available
export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiClient.getHealth();
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

// Generate a simple user session ID
export function generateUserSession(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default api;
