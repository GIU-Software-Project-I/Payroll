const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:500';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

// Get access token from cookie
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Set access token in cookie
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  // Set cookie with 7 days expiry, secure in production
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${secure}`;
}

// Remove access token from cookie
export function removeAccessToken(): void {
  if (typeof window === 'undefined') return;
  document.cookie = 'access_token=; path=/; max-age=0';
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if we have a token
    const token = getAccessToken();
    if (token) {
      (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId); // Clear timeout on successful response

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          // If JSON parsing fails, try to get text
          const text = await response.text();
          console.error('[API] Failed to parse JSON response:', text);
          return {
            error: `Invalid JSON response: ${text.substring(0, 100)}`,
            status: response.status,
          };
        }
      } else if (response.ok) {
        // If response is OK but not JSON, return empty data
        data = null;
      }

      if (!response.ok) {
        return {
          error: data?.message || data?.error || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId); // Clear timeout on error
      console.error('[API] Request failed:', url);
      console.error('[API] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's a network error or timeout
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('aborted') ||
          errorMessage.includes('timeout')) {
        return {
          error: `Cannot connect to server at ${this.baseUrl}. Please ensure:
1. The backend server is running (check terminal/console)
2. The backend is running on port 9000
3. No firewall is blocking the connection
4. Try accessing http://localhost:9000/auth/health in your browser`,
          status: 0,
        };
      }
      return {
        error: errorMessage,
        status: 0,
      };
    }
  }

  async get<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, data?: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T>(endpoint: string, data?: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  // Special method for downloading files (returns blob)
  async downloadFile(endpoint: string): Promise<{ blob?: Blob; filename?: string; error?: string }> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {};
    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        return { error: `Download failed: ${response.status}` };
      }

      const blob = await response.blob();
      
      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'download';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (match) {
          filename = match[1];
        }
      }

      return { blob, filename };
    } catch (error) {
      console.error('[API] Download failed:', error);
      return { error: error instanceof Error ? error.message : 'Download failed' };
    }
  }
}

const apiService = new ApiService(API_BASE_URL);

export default apiService;
export { API_BASE_URL };

