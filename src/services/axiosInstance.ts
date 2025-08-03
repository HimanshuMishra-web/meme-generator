import { API_URL } from '../../constants';

interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      
      if (response.status === 401) {
        // Try to refresh token on unauthorized
        await this.handleUnauthorized();
        throw new Error('Unauthorized - Please log in again');
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Handle both direct data and wrapped data structures
    return data.data || data;
  }

  private async handleUnauthorized() {
    // Try to refresh the token first
    const auth = localStorage.getItem('meme-app-auth');
    if (auth) {
      const { token } = JSON.parse(auth);
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const { user, token: newToken } = data.data;
          localStorage.setItem('meme-app-auth', JSON.stringify({ user, token: newToken }));
          return; // Token refreshed successfully, don't redirect
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
    
    // If refresh failed, clear auth data and redirect
    localStorage.removeItem('meme-app-auth');
    window.location.href = '/signin';
  }

  private getAuthToken(): string | null {
    const auth = localStorage.getItem('meme-app-auth');
    return auth ? JSON.parse(auth).token : null;
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const authToken = token || this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const headers: Record<string, string> = {};
    
    const authToken = token || this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Handle FormData vs JSON
    let body: string | FormData;
    if (data instanceof FormData) {
      body = data;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: any, token?: string, isFormData?: boolean): Promise<T> {
    const headers: Record<string, string> = {};
    const authToken = token || this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    let body: any;
    if (isFormData && data instanceof FormData) {
      body = data;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    }
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    const headers: Record<string, string> = {};
    
    const authToken = token || this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiService = new ApiService(API_URL); 