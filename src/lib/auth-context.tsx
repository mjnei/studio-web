"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  type UserResponse,
  setAccessToken,
} from "@/lib/api-client";
import { isPushNotificationsSupported, setupPushNotifications } from "@/lib/push-notifications";

type AuthContextValue = {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  signupWithPassword: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = user !== null;

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const session = await fetchSession();
      if (session) {
        await refreshUser();
        // Setup push notifications if supported
        if (isPushNotificationsSupported()) {
          setupPushNotifications().catch((error) =>
            console.warn("Failed to setup push notifications:", error)
          );
        }
      }
      setIsLoading(false);
    })();
  }, [refreshUser]);

  useEffect(() => {
    if (isLoading) return;
    const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
    const isOnboardingRoute = pathname === ONBOARDING_ROUTE;
    const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));

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

  const loginWithGoogle = useCallback(async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const idToken = await credential.user.getIdToken();
    await loginWithFirebase(idToken);
    const me = await getMe();
    setUser(me);

    // Setup push notifications if supported
    if (isPushNotificationsSupported()) {
      setupPushNotifications().catch((error) =>
        console.warn("Failed to setup push notifications:", error)
      );
    }

    // Redirect based on onboarding status
    if (!me.onboarding_completed) {
      router.push(ONBOARDING_ROUTE);
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      await apiLoginWithPassword(email, password);
      const me = await getMe();
      setUser(me);

      // Setup push notifications if supported
      if (isPushNotificationsSupported()) {
        setupPushNotifications().catch((error) =>
          console.warn("Failed to setup push notifications:", error)
        );
      }

      // Redirect based on onboarding status
      if (!me.onboarding_completed) {
        router.push(ONBOARDING_ROUTE);
      } else {
        router.push("/dashboard");
      }
    },
    [router]
  );

  const signupWithPassword = useCallback(
    async (email: string, password: string, name: string) => {
      await apiSignupWithPassword(email, password, name);
      const me = await getMe();
      setUser(me);

      // Setup push notifications if supported
      if (isPushNotificationsSupported()) {
        setupPushNotifications().catch((error) =>
          console.warn("Failed to setup push notifications:", error)
        );
      }

      // New users should go to onboarding
      if (!me.onboarding_completed) {
        router.push(ONBOARDING_ROUTE);
      } else {
        router.push("/dashboard");
      }
    },
    [router]
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
  const pathname = usePathname();
  const router = useRouter();
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isLoading && isProtectedRoute && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isProtectedRoute, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-base">
        <div className="text-sm text-text-muted">Loading...</div>
      </div>
    );
  }

  if (isProtectedRoute && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
