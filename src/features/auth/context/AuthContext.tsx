/* ============================================
   CONTEXTO: AuthContext
   Descripción: Manejo global del estado de autenticación
   FiscalHost Inteligente CR
   ============================================ */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, FC } from 'react';
import type { UsuarioInfo, LoginRequest } from '../types/auth';
import { AuthService } from '../services/AuthService';

export interface AuthContextType {
  user: UsuarioInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: UsuarioInfo | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UsuarioInfo | null>(() => {
    const raw = localStorage.getItem('usuario');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user));
    } else {
      localStorage.removeItem('usuario');
    }
  }, [user]);

  const login = async (credentials: LoginRequest) => {
    const data = await AuthService.login(credentials);
    if (data && data.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      if (data.usuario) {
        setUser(data.usuario);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    const token = localStorage.getItem('token');
    let user: UsuarioInfo | null = null;
    try {
      user = JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
      user = null;
    }
    return {
      user,
      token,
      isAuthenticated: Boolean(token),
      login: async () => {},
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      },
      setUser: () => {},
    };
  }
  return context;
};

export default AuthContext;
