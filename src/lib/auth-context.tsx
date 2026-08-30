"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useI18n, getUiLocaleFromApi } from "@/i18n";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import {
  loginWithFirebase,
  loginWithPassword as apiLoginWithPassword,
  signupWithPassword as apiSignupWithPassword,
  fetchSession,
  logout as apiLogout,
  getMe,
  deleteUser as apiDeleteUser,
  isReferralRequiredError,
  type UserResponse,
  setAccessToken,
} from "@/lib/api-client";

type AuthContextValue = {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: (referralCode?: string | null) => Promise<{
    isNewUser: boolean;
    isComebackUser: boolean;
    referralIpRateLimited: boolean;
  }>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  signupWithPassword: (
    email: string,
    password: string,
    name: string,
    referralCode?: string | null
  ) => Promise<{ referralIpRateLimited: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/referral-required"];
const ONBOARDING_ROUTE = "/onboarding";
const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/projects",
  "/movies",
  "/voices",
  "/jobs",
  "/profile",
  "/settings",
  "/referral",
  "/help",
  "/project",
  "/admin",
];

/** True when pathname is exactly `prefix` or a nested path under it (not `/referral` matching `/referral-required`). */
function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { setLocale } = useI18n();

  const isAuthenticated = user !== null;

  const applyUserLocale = useCallback(
    (me: UserResponse) => {
      const uiLocale = getUiLocaleFromApi(me.locale);
      if (uiLocale) setLocale(uiLocale);
    },
    [setLocale]
  );

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
      applyUserLocale(me);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, [applyUserLocale]);

  useEffect(() => {
    (async () => {
      const session = await fetchSession();
      if (session) {
        await refreshUser();
      }
      setIsLoading(false);
    })();
  }, [refreshUser]);

  useEffect(() => {
    if (isLoading) return;
    const isAuthRoute = AUTH_ROUTES.some((r) => matchesPathPrefix(pathname, r));
    const isOnboardingRoute = pathname === ONBOARDING_ROUTE;
    const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((p) => matchesPathPrefix(pathname, p));

    // User not authenticated and trying to access protected route → redirect to login
    if (isProtectedRoute && !isAuthenticated) {
      router.replace("/login");
    }
    // User authenticated but at auth route → redirect based on onboarding status
    else if (isAuthRoute && isAuthenticated) {
      if (!user?.onboarding_completed) {
        router.replace(ONBOARDING_ROUTE);
      } else {
        router.replace("/dashboard");
      }
    }
    // User authenticated, onboarding not complete, trying to access protected route → redirect to onboarding
    else if (isAuthenticated && !user?.onboarding_completed && isProtectedRoute) {
      router.replace(ONBOARDING_ROUTE);
    }
    // User authenticated, onboarding complete, at onboarding route → redirect to dashboard
    else if (isAuthenticated && user?.onboarding_completed && isOnboardingRoute) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  const loginWithGoogle = useCallback(
    async (referralCode?: string | null) => {
      try {
        const credential = await signInWithPopup(auth, googleProvider);
        const idToken = await credential.user.getIdToken();
        const tokenRes = await loginWithFirebase(idToken, referralCode);
        const me = await getMe();
        setUser(me);
        applyUserLocale(me);

        // Redirect based on onboarding status
        if (!me.onboarding_completed) {
          router.push(ONBOARDING_ROUTE);
        } else {
          router.push("/dashboard");
        }

        return {
          isNewUser: Boolean(tokenRes.is_new_user),
          isComebackUser: Boolean(tokenRes.is_comeback_user),
          referralIpRateLimited: Boolean(tokenRes.referral_ip_rate_limited),
        };
      } catch (err) {
        // Clear Firebase session if backend rejected (e.g. missing referral for new account)
        try {
          await firebaseSignOut(auth);
        } catch {
          /* ignore */
        }
        if (!referralCode && isReferralRequiredError(err)) {
          router.replace("/referral-required");
        }
        throw err;
      }
    },
    [router, applyUserLocale]
  );

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      await apiLoginWithPassword(email, password);
      const me = await getMe();
      setUser(me);
      applyUserLocale(me);

      // Redirect based on onboarding status
      if (!me.onboarding_completed) {
        router.push(ONBOARDING_ROUTE);
      } else {
        router.push("/dashboard");
      }
    },
    [router, applyUserLocale]
  );

  const signupWithPassword = useCallback(
    async (email: string, password: string, name: string, referralCode?: string | null) => {
      const tokenRes = await apiSignupWithPassword(email, password, name, referralCode);
      const me = await getMe();
      setUser(me);
      applyUserLocale(me);

      // New users should go to onboarding
      if (!me.onboarding_completed) {
        router.push(ONBOARDING_ROUTE);
      } else {
        router.push("/dashboard");
      }

      return {
        referralIpRateLimited: Boolean(tokenRes.referral_ip_rate_limited),
      };
    },
    [router, applyUserLocale]
  );

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    await apiLogout();
    setUser(null);
    setAccessToken(null);
    router.replace("/login");
  }, [router]);

  const deleteUser = useCallback(async () => {
    await apiDeleteUser();
    try {
      await firebaseSignOut(auth);
    } catch {}
    setUser(null);
    setAccessToken(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        loginWithGoogle,
        loginWithPassword,
        signupWithPassword,
        logout,
        refreshUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((p) => matchesPathPrefix(pathname, p));

  useEffect(() => {
    if (!isLoading && isProtectedRoute && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isProtectedRoute, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="app-shell-height safe-area-x safe-area-y flex items-center justify-center">
        <div className="text-body text-text-muted">{t("common.loading")}</div>
      </div>
    );
  }

  if (isProtectedRoute && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
