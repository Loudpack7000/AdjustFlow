import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token when available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Log the full URL being called
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`API Request: ${config.method?.toUpperCase()} ${fullUrl}`, config.data || config.params || '');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and auth
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle 401 unauthorized - redirect to login
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      localStorage.removeItem('authToken');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API Health Check
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Root API info
export const getApiInfo = async () => {
  try {
    const response = await apiClient.get('/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth API calls
export const authApi = {
  status: () => apiClient.get('/api/v1/auth/status'),
  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => apiClient.post('/api/v1/auth/register', data),
  login: (data: {
    email: string;
    password: string;
  }) => apiClient.post('/api/v1/auth/login', data),
  me: () => apiClient.get('/api/v1/auth/me'),
  listUsers: () => apiClient.get('/api/v1/auth/users'),
};

// Auth utilities
export const authUtils = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },
  isAuthenticated: () => {
    return authUtils.getToken() !== null;
  },
};

// Projects API calls
export const projectsApi = {
  list: () => apiClient.get('/api/v1/projects/'),
  create: (data: any) => apiClient.post('/api/v1/projects/', data),
  get: (id: string) => apiClient.get(`/api/v1/projects/${id}`),
  update: (id: string, data: any) => apiClient.put(`/api/v1/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/projects/${id}`),
};


// Export API calls
export const exportsApi = {
  excel: (projectId: string) => apiClient.get(`/api/v1/exports/excel/${projectId}`),
  pdf: (projectId: string) => apiClient.get(`/api/v1/exports/pdf/${projectId}`),
  csv: (projectId: string) => apiClient.get(`/api/v1/exports/csv/${projectId}`),
};

// Dashboard API calls
export const dashboardApi = {
  get: () => apiClient.get('/api/v1/dashboard/'),
};

// Contacts API calls
export const contactsApi = {
  list: (search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sortBy) params.append('sort_by', sortBy);
    if (sortOrder) params.append('sort_order', sortOrder);
    const query = params.toString();
    return apiClient.get(`/api/v1/contacts/${query ? '?' + query : ''}`);
  },
  get: (id: string) => apiClient.get(`/api/v1/contacts/${id}`),
  create: (data: any) => apiClient.post('/api/v1/contacts/', data),
  update: (id: string, data: any) => apiClient.put(`/api/v1/contacts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/contacts/${id}`),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/v1/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Tasks API calls
export const tasksApi = {
  list: (params?: { status_filter?: string; assigned_to?: number; project_id?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
    if (params?.assigned_to) queryParams.append('assigned_to', params.assigned_to.toString());
    if (params?.project_id) queryParams.append('project_id', params.project_id.toString());
    const query = queryParams.toString();
    return apiClient.get(`/api/v1/tasks/${query ? '?' + query : ''}`);
  },
  getMyTasks: (status_filter?: string) => {
    const params = status_filter ? `?status_filter=${encodeURIComponent(status_filter)}` : '';
    return apiClient.get(`/api/v1/tasks/my-tasks${params}`);
  },
  get: (id: string) => apiClient.get(`/api/v1/tasks/${id}`),
  create: (data: any) => apiClient.post('/api/v1/tasks/', data),
  update: (id: string, data: any) => apiClient.put(`/api/v1/tasks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/tasks/${id}`),
  complete: (id: string) => apiClient.patch(`/api/v1/tasks/${id}/complete`),
};

// Task Types API calls
export const taskTypesApi = {
  list: () => apiClient.get('/api/v1/task-types/'),
  create: (data: { name: string; description?: string }) => apiClient.post('/api/v1/task-types/', data),
  update: (id: string, data: { name?: string; description?: string }) => apiClient.put(`/api/v1/task-types/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/task-types/${id}`),
};

// Boards API calls
export const boardsApi = {
  list: () => apiClient.get('/api/v1/boards/'),
  get: (id: string) => apiClient.get(`/api/v1/boards/${id}`),
  create: (data: { name: string; description?: string; color?: string; columns?: Array<{ name: string; position: number }> }) => 
    apiClient.post('/api/v1/boards/', data),
  update: (id: string, data: { name?: string; description?: string; color?: string }) => 
    apiClient.put(`/api/v1/boards/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/boards/${id}`),
  createColumn: (boardId: string, data: { name: string; position: number; color?: string; wip_limit?: number }) =>
    apiClient.post(`/api/v1/boards/${boardId}/columns`, data),
  updateColumn: (columnId: string, data: { name?: string; position?: number; color?: string; wip_limit?: number }) =>
    apiClient.put(`/api/v1/boards/columns/${columnId}`, data),
  deleteColumn: (columnId: string) => apiClient.delete(`/api/v1/boards/columns/${columnId}`),
  createCard: (columnId: string, data: { contact_id: number; position: number; notes?: string }) =>
    apiClient.post(`/api/v1/boards/columns/${columnId}/cards`, data),
  updateCard: (cardId: string, data: { board_column_id?: number; position?: number; notes?: string }) =>
    apiClient.put(`/api/v1/boards/cards/${cardId}`, data),
  deleteCard: (cardId: string) => apiClient.delete(`/api/v1/boards/cards/${cardId}`),
};

// Activities API calls
export const activitiesApi = {
  listByContact: (contactId: string, params?: { activity_type?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.activity_type) queryParams.append('activity_type', params.activity_type);
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return apiClient.get(`/api/v1/activities/contact/${contactId}${query ? '?' + query : ''}`);
  },
  get: (id: string) => apiClient.get(`/api/v1/activities/${id}`),
  create: (contactId: string, data: any) => apiClient.post(`/api/v1/activities/contact/${contactId}`, data),
  update: (id: string, data: any) => apiClient.put(`/api/v1/activities/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/activities/${id}`),
};

// Documents API calls
export const documentsApi = {
  listCategories: () => apiClient.get('/api/v1/documents/categories'),
  createCategory: (data: any) => apiClient.post('/api/v1/documents/categories', data),
  listByContact: (contactId: string, categoryId?: number) => {
    const params = categoryId ? `?category_id=${categoryId}` : '';
    return apiClient.get(`/api/v1/documents/contact/${contactId}${params}`);
  },
  upload: (contactId: string, file: File, categoryId?: number, description?: string, isPrivate?: boolean) => {
    const formData = new FormData();
    formData.append('file', file);
    if (categoryId) formData.append('category_id', categoryId.toString());
    if (description) formData.append('description', description);
    if (isPrivate !== undefined) formData.append('is_private', isPrivate.toString());
    return apiClient.post(`/api/v1/documents/contact/${contactId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id: string | number, data: { category_id?: number; description?: string; is_private?: boolean }) => 
    apiClient.put(`/api/v1/documents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/documents/${id}`),
  getViewUrl: (id: string | number) => {
    // Note: These URLs should be used with authenticated requests
    return `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${id}/view`;
  },
  getThumbnailUrl: (id: string | number) => {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${id}/thumbnail`;
  },
  getDownloadUrl: (id: string | number) => {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${id}/download`;
  },
  // Helper to get authenticated document blob
  getDocumentBlob: async (id: string | number, download: boolean = false, thumbnail: boolean = false) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    let endpoint = 'view';
    if (download) endpoint = 'download';
    if (thumbnail) endpoint = 'thumbnail';
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${id}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch document ${id}:`, response.status, errorText);
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Document blob is empty');
      }
      
      return blob;
    } catch (error: any) {
      console.error('Error fetching document blob:', error);
      throw error;
    }
  },
};

// Contact Fields API calls
export const contactFieldsApi = {
  list: (includeInactive?: boolean) => {
    const params = includeInactive ? `?include_inactive=true` : '';
    return apiClient.get(`/api/v1/contact-fields${params}`);
  },
  get: (id: string) => apiClient.get(`/api/v1/contact-fields/${id}`),
  create: (data: any) => apiClient.post('/api/v1/contact-fields/', data),
  update: (id: string, data: any) => apiClient.put(`/api/v1/contact-fields/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/contact-fields/${id}`),
  applyTemplate: (templateName: string) => apiClient.post('/api/v1/contact-fields/apply-template', { template_name: templateName }),
};

// Teams API calls
export const teamsApi = {
  listRoles: () => apiClient.get('/api/v1/teams/roles'),
  createRole: (data: any) => apiClient.post('/api/v1/teams/roles', data),
  listAccessProfiles: (roleId?: number) => {
    const params = roleId ? `?role_id=${roleId}` : '';
    return apiClient.get(`/api/v1/teams/access-profiles${params}`);
  },
  createAccessProfile: (data: any) => apiClient.post('/api/v1/teams/access-profiles', data),
  updateAccessProfile: (profileId: string, data: any) => apiClient.put(`/api/v1/teams/access-profiles/${profileId}`, data),
  deleteAccessProfile: (profileId: string) => apiClient.delete(`/api/v1/teams/access-profiles/${profileId}`),
  listUsers: (params?: { access_profile_id?: number; role_id?: number; is_active?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.access_profile_id) queryParams.append('access_profile_id', params.access_profile_id.toString());
    if (params?.role_id) queryParams.append('role_id', params.role_id.toString());
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    const query = queryParams.toString();
    return apiClient.get(`/api/v1/teams/users${query ? '?' + query : ''}`);
  },
  listSalesReps: () => apiClient.get('/api/v1/teams/users/sales-reps'),
  createUser: (data: any) => apiClient.post('/api/v1/teams/users', data),
  updateUser: (userId: string, data: any) => apiClient.put(`/api/v1/teams/users/${userId}`, data),
  deleteUser: (userId: string) => apiClient.delete(`/api/v1/teams/users/${userId}`),
  getRoleStats: (roleId: string) => apiClient.get(`/api/v1/teams/roles/${roleId}/stats`),
};

// Company API calls
export const companyApi = {
  get: () => apiClient.get('/api/v1/company/'),
  update: (data: any) => apiClient.put('/api/v1/company/', data),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/v1/company/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};