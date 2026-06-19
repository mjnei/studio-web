"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import {
  loginWithFirebase,
  loginWithPassword as apiLoginWithPassword,
  fetchSession,
  logout as apiLogout,
  getMe,
  deleteUser as apiDeleteUser,
  type UserResponse,
  setAccessToken,
} from "@/lib/api-client";

type AuthContextValue = {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];
const PROTECTED_ROUTE_PREFIXES = ["/dashboard", "/projects", "/movies", "/voices", "/jobs", "/profile", "/settings", "/referral", "/help"];

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
      }
      setIsLoading(false);
    })();
  }, [refreshUser]);

  useEffect(() => {
    if (isLoading) return;
    const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
    const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));
    if (isProtectedRoute && !isAuthenticated) {
      router.replace("/login");
    } else if (isAuthRoute && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const loginWithGoogle = useCallback(async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const idToken = await credential.user.getIdToken();
    await loginWithFirebase(idToken);
    await refreshUser();
  }, [refreshUser]);

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      await apiLoginWithPassword(email, password);
      await refreshUser();
    },
    [refreshUser],
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
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));

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
