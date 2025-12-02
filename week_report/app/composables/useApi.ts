const API_BASE_URL = 'http://localhost:3001/api'

interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

interface ApiError {
  message: string
  statusCode: number
}

export const useApi = () => {
  const token = useCookie('auth_token')

  const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      ...options.headers,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || '请求失败',
        statusCode: response.status,
      }
      throw error
    }

    return data as T
  }

  const get = <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' })

  const post = <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })

  const put = <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })

  const del = <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' })

  return {
    get,
    post,
    put,
    del,
    request,
  }
}
