import { createContext, useContext, useState, useCallback, ReactNode, createElement } from "react";
import { authApi, UserInfo } from "@/api/client";

type AuthState = {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null, token: null, loading: false, error: null,
  login: async () => {}, logout: () => {}, checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("crm_token"),
    loading: false,
    error: null,
  });

  const login = useCallback(async (loginVal: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { token, user } = await authApi.login(loginVal, password);
      localStorage.setItem("crm_token", token);
      setState({ user, token, loading: false, error: null });
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: (e as Error).message }));
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("crm_token");
    setState({ user: null, token: null, loading: false, error: null });
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("crm_token");
    if (!token) return;
    setState(s => ({ ...s, loading: true }));
    try {
      const { user } = await authApi.me();
      setState({ user, token, loading: false, error: null });
    } catch {
      localStorage.removeItem("crm_token");
      setState({ user: null, token: null, loading: false, error: null });
    }
  }, []);

  return createElement(AuthContext.Provider, {
    value: { ...state, login, logout, checkAuth },
    children,
  });
}

export function useAuth() {
  return useContext(AuthContext);
}
