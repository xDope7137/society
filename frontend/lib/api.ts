import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh token for login/register endpoints
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login/') || 
                          originalRequest?.url?.includes('/auth/register/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login/', credentials),
  register: (userData: any) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: any) => api.put('/auth/profile/', data),
  changePassword: (data: any) => api.post('/auth/change-password/', data),
  getUsers: () => api.get('/auth/users/'),
  updateUser: (userId: number, data: any) => api.put(`/auth/users/${userId}/`, data),
};

// Society API
export const societyAPI = {
  getSocieties: () => api.get('/society/societies/'),
  getSociety: (id: number) => api.get(`/society/societies/${id}/`),
  getFlats: (params?: any) => api.get('/society/flats/', { params }),
  getFlat: (id: number) => api.get(`/society/flats/${id}/`),
  getDirectory: () => api.get('/society/flats/directory/'),
  getDashboard: () => api.get('/society/flats/dashboard/'),
  updateFlat: (id: number, data: any) => api.put(`/society/flats/${id}/`, data),
  createFlat: (data: any) => api.post('/society/flats/', data),
  deleteFlat: (id: number) => api.delete(`/society/flats/${id}/`),
};

// Blocks API
export const blocksAPI = {
  getBlocks: (params?: any) => api.get('/society/blocks/', { params }),
  getBlock: (id: number) => api.get(`/society/blocks/${id}/`),
  createBlock: (data: any) => api.post('/society/blocks/', data),
  createBlockWithFlats: (data: any) => api.post('/society/blocks/create_with_flats/', data),
  updateBlock: (id: number, data: any) => api.put(`/society/blocks/${id}/`, data),
  regenerateFlats: (id: number) => api.post(`/society/blocks/${id}/regenerate_flats/`),
  deleteBlock: (id: number) => api.delete(`/society/blocks/${id}/`),
};

// Notices API
export const noticesAPI = {
  getNotices: (params?: any) => api.get('/notices/', { params }),
  getNotice: (id: number) => api.get(`/notices/${id}/`),
  createNotice: (data: any) => api.post('/notices/', data),
  updateNotice: (id: number, data: any) => api.put(`/notices/${id}/`, data),
  deleteNotice: (id: number) => api.delete(`/notices/${id}/`),
};

// Visitors API
export const visitorsAPI = {
  getVisitors: (params?: any) => api.get('/visitors/', { params }),
  getVisitor: (id: number) => api.get(`/visitors/${id}/`),
  createVisitor: (data: any) => api.post('/visitors/', data),
  checkIn: (id: number, data?: any) => api.post(`/visitors/${id}/check_in/`, data),
  checkOut: (id: number, data?: any) => api.post(`/visitors/${id}/check_out/`, data),
  approve: (id: number) => api.post(`/visitors/${id}/approve/`),
  reject: (id: number) => api.post(`/visitors/${id}/reject/`),
  getActive: () => api.get('/visitors/active/'),
  getPending: () => api.get('/visitors/pending/'),
};

// Complaints API
export const complaintsAPI = {
  getComplaints: (params?: any) => api.get('/complaints/', { params }),
  getComplaint: (id: number) => api.get(`/complaints/${id}/`),
  createComplaint: (data: any) => api.post('/complaints/', data),
  addUpdate: (id: number, data: any) => api.post(`/complaints/${id}/add_update/`, data),
  assign: (id: number, data: any) => api.post(`/complaints/${id}/assign/`, data),
  resolve: (id: number, data: any) => api.post(`/complaints/${id}/resolve/`, data),
  close: (id: number) => api.post(`/complaints/${id}/close/`),
  getStats: () => api.get('/complaints/stats/'),
};

// Billing API
export const billingAPI = {
  getBills: (params?: any) => api.get('/billing/bills/', { params }),
  getBill: (id: number) => api.get(`/billing/bills/${id}/`),
  getMyBills: () => api.get('/billing/bills/my_bills/'),
  recordPayment: (id: number, data: any) => api.post(`/billing/bills/${id}/record_payment/`, data),
  markPaid: (id: number, data?: any) => api.post(`/billing/bills/${id}/mark_paid/`, data || {}),
  getStats: () => api.get('/billing/bills/stats/'),
  getPayments: (params?: any) => api.get('/billing/payments/', { params }),
};

// Events API
export const eventsAPI = {
  getEvents: (params?: any) => api.get('/events/', { params }),
  getEvent: (id: number) => api.get(`/events/${id}/`),
  createEvent: (data: any) => api.post('/events/', data),
  updateEvent: (id: number, data: any) => api.put(`/events/${id}/`, data),
  deleteEvent: (id: number) => api.delete(`/events/${id}/`),
  rsvpEvent: (id: number) => api.post(`/events/${id}/rsvp/`),
  getUpcomingEvents: (days?: number) => api.get('/events/upcoming/', { params: { days } }),
};

// Alerts API
export const alertsAPI = {
  getAlerts: (params?: any) => api.get('/alerts/', { params }),
  getAlert: (id: number) => api.get(`/alerts/${id}/`),
  createAlert: (data: any) => api.post('/alerts/', data),
  updateAlert: (id: number, data: any) => api.put(`/alerts/${id}/`, data),
  deleteAlert: (id: number) => api.delete(`/alerts/${id}/`),
  acknowledgeAlert: (id: number) => api.post(`/alerts/${id}/acknowledge/`),
  getActiveAlerts: () => api.get('/alerts/active/'),
  getUnacknowledgedCount: () => api.get('/alerts/unacknowledged-count/'),
};

