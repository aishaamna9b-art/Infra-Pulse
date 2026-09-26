import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create a configured Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Note: Add auth token injection here when auth is implemented
    // const token = getAuthToken();
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    // Note: Add global error handling here (e.g. redirect on 401, toast on 500)
    return Promise.reject(error);
  }
);

// Example API Service pattern
export const IncidentAPI = {
  /**
   * Fetch all open incidents (Admin)
   */
  getIncidents: async () => {
    const { data } = await apiClient.get('/incidents');
    return data;
  },

  /**
   * Submit a new citizen report
   */
  createIncident: async (payload: { description: string; latitude: number; longitude: number; audio_base64?: string }) => {
    const { data } = await apiClient.post('/incidents', payload);
    return data;
  },

  /**
   * Dispatch contractor for an escalated incident (Admin)
   */
  dispatchContractor: async (incidentId: string) => {
    const { data } = await apiClient.post(`/incidents/${incidentId}/dispatch`);
    return data;
  }
};
