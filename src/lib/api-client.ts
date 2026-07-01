const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

let accessToken: string | null = null;
let tokenExpiresAt: number | null = null;
let refreshTimer: NodeJS.Timeout | null = null;

// Parse JWT to extract expiration time
function parseJwtExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch {
    return null;
  }
}

// Schedule proactive token refresh before expiration
function scheduleTokenRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (!tokenExpiresAt) return;

  const now = Date.now();
  const timeUntilExpiry = tokenExpiresAt - now;

  // Refresh 2 minutes before expiration (or immediately if less than 2 minutes remain)
  const refreshBuffer = 2 * 60 * 1000; // 2 minutes in milliseconds
  const refreshIn = Math.max(0, timeUntilExpiry - refreshBuffer);

  if (refreshIn > 0) {
    refreshTimer = setTimeout(async () => {
      const refreshed = await refreshSession();
      if (!refreshed) {
        console.warn("Proactive token refresh failed");
      }
    }, refreshIn);
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;

  if (token) {
    tokenExpiresAt = parseJwtExpiration(token);
    scheduleTokenRefresh();
  } else {
    tokenExpiresAt = null;
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  }
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

  // Handle 401 Unauthorized - attempt token refresh
  if (res.status === 401 && !path.includes("/auth/")) {
    const refreshed = await refreshSession();
    if (refreshed) {
      // Update headers with new token
      const retryHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };
      if (accessToken) {
        retryHeaders["Authorization"] = `Bearer ${accessToken}`;
      }

      const retry = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });

      if (!retry.ok) {
        const errorText = await retry.text();
        if (retry.status === 401) {
          // Even after refresh, still unauthorized - clear session
          setAccessToken(null);
          throw new ApiError(401, "Session expired. Please log in again.");
        }
        throw new ApiError(retry.status, errorText);
      }

      if (retry.status === 204) return undefined as T;
      return retry.json();
    }

    // Refresh failed - clear session
    setAccessToken(null);
    throw new ApiError(401, "Session expired. Please log in again.");
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
  role: string;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
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

export async function completeOnboarding(): Promise<UserResponse> {
  return request<UserResponse>("/users/me/onboarding", {
    method: "PATCH",
  });
}
