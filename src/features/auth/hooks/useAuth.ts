import { useMutation } from '@tanstack/react-query';
import { AuthService } from '../services/AuthService';
import type { LoginRequest, RegistroRequest } from '../types/auth';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => AuthService.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      if (data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      }
      navigate('/');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegistroRequest) => AuthService.register(data),
    onSuccess: () => {
      navigate('/login');
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const getUser = () => {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  return {
    user: getUser(),
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout
  };
};
