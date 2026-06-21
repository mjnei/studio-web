const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (res.status === 401 && !path.includes("/auth/") && !path.includes("/login")) {
    const refreshed = await refreshSession();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
      if (!retry.ok) {
        const errorText = await retry.text();
        throw new ApiError(retry.status, errorText);
      }
      return retry.json();
    }
    setAccessToken(null);
    throw new ApiError(401, "Session expired");
  }
  if (!res.ok) {
    const errorText = await res.text();
    // Try to parse JSON error response
    try {
      const errorJson = JSON.parse(errorText);
      throw new ApiError(res.status, errorJson.detail || errorJson.message || errorText);
    } catch {
      throw new ApiError(res.status, errorText);
    }
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function loginWithFirebase(idToken: string): Promise<{ access_token: string }> {
  const res = await request<{ access_token: string }>("/auth/firebase-login", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
  setAccessToken(res.access_token);
  return res;
}

export async function loginWithPassword(
  email: string,
  password: string
): Promise<{ access_token: string }> {
  const res = await request<{ access_token: string }>("/users/login/password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(res.access_token);
  return res;
}

export async function signupWithPassword(
  email: string,
  password: string,
  name: string
): Promise<{ access_token: string }> {
  const res = await request<{ access_token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  setAccessToken(res.access_token);
  return res;
}

async function refreshSession(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/session`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.access_token);
    return true;
  } catch {
    return false;
  }
}

export async function fetchSession(): Promise<{ access_token: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/session`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessToken(data.access_token);
    return data;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
  }
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  given_name: string | null;
  family_name: string | null;
  picture_url: string | null;
  locale: string | null;
  provider: string;
  has_password: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getMe(): Promise<UserResponse> {
  return request<UserResponse>("/users/me");
}

export async function updateUser(data: {
  name?: string;
  given_name?: string;
  family_name?: string;
  picture_url?: string;
  locale?: string;
}): Promise<UserResponse> {
  return request<UserResponse>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function setPassword(password: string): Promise<UserResponse> {
  return request<UserResponse>("/users/me/set-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<UserResponse> {
  return request<UserResponse>("/users/me/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export async function deleteUser(): Promise<void> {
  await request<void>("/users/me", { method: "DELETE" });
  setAccessToken(null);
}
