export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface ApiOptions extends RequestInit {
  params?: Record<string, unknown>;
}

async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers as Record<string, string>),
    },
    ...fetchOptions,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { message?: string; data?: { message?: string } };
    const message = errorData.message ?? errorData.data?.message ?? 'Request failed';
    throw new ApiError(response.status, message, errorData);
  }

  if (response.status === 204) return undefined as T;

  // All backend responses are wrapped in { success, data, ... } by the ResponseInterceptor
  const json = await response.json() as { success?: boolean; data: T };
  return (json.data !== undefined ? json.data : json) as T;
}

export const api = {
  get: <T>(endpoint: string, options?: ApiOptions): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: ApiOptions): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
