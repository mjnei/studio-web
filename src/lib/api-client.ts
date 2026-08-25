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

declare global {
  interface Window {
    getAccessToken?: typeof getAccessToken;
  }
}

// Debug helper - expose token to window in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.getAccessToken = getAccessToken;
}

function shouldAttemptSessionRefreshOn401(path: string): boolean {
  // Credential endpoints return 401 for bad login — not an expired session.
  if (path.includes("/users/login/password")) {
    return false;
  }
  // Other /auth/* routes (register, firebase-login, etc.) handle their own 401s.
  if (path.includes("/auth/")) {
    return false;
  }
  return true;
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

  // Handle 401 Unauthorized - attempt token refresh for authenticated API calls
  if (res.status === 401 && shouldAttemptSessionRefreshOn401(path)) {
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
    } catch (err) {
      if (err instanceof ApiError) throw err;
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

/** Backend rejects new-account creation without a referral code. */
export const REFERRAL_CODE_REQUIRED = "Referral code is required to create an account";
/** Backend rejects new-account creation with an unknown referral code. */
export const REFERRAL_CODE_INVALID = "Invalid referral code";

function referralRequiredMessage(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }
  return error.message;
}

export function isReferralRequiredError(error: unknown): boolean {
  const message = referralRequiredMessage(error);
  if (!message) {
    return false;
  }
  return (
    message.includes(REFERRAL_CODE_REQUIRED) ||
    (error instanceof ApiError &&
      error.status === 400 &&
      message.includes("Referral code is required"))
  );
}

export function isReferralInvalidError(error: unknown): boolean {
  return error instanceof Error && error.message.includes(REFERRAL_CODE_INVALID);
}

export interface AuthTokenResponse {
  access_token: string;
  token_type?: string;
  is_comeback_user?: boolean;
  is_new_user?: boolean;
}

export async function loginWithFirebase(
  idToken: string,
  referralCode?: string | null
): Promise<AuthTokenResponse> {
  const body: { id_token: string; referral_code?: string } = { id_token: idToken };
  if (referralCode) {
    body.referral_code = referralCode;
  }

  const res = await request<AuthTokenResponse>("/auth/firebase-login", {
    method: "POST",
    body: JSON.stringify(body),
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
  name: string,
  referralCode?: string | null
): Promise<{ access_token: string }> {
  const body: { email: string; password: string; name: string; referral_code?: string } = {
    email,
    password,
    name,
  };
  if (referralCode) {
    body.referral_code = referralCode;
  }

  const res = await request<{ access_token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
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
  picture_url: string | null;
  locale: string | null;
  provider: string;
  has_password: boolean;
  is_active: boolean;
  role: string;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  membership_tier: "free" | "pro" | "premium";
  subscription_status: "active" | "canceled" | "expired" | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function getMe(): Promise<UserResponse> {
  return request<UserResponse>("/users/me");
}

export async function updateUser(data: {
  name?: string;
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

export async function setUserPassword(password: string): Promise<UserResponse> {
  return request<UserResponse>("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });
}

export async function resetOnboarding(): Promise<UserResponse> {
  return request<UserResponse>("/users/me/onboarding", {
    method: "DELETE",
  });
}

export interface UserCreditsResponse {
  user_id: number;
  credits_remaining: number;
  monthly_credits: number;
  bonus_credits: number;
  credits_used_this_month: number;
  reset_date: string;
}

export async function gimmeCredits(): Promise<UserCreditsResponse> {
  return request<UserCreditsResponse>("/users/me/gimme-credits", {
    method: "POST",
  });
}
