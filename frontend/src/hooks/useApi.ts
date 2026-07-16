import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store';
import { useDashboardStore } from '../store';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, logout: storeLogout } = useAuthStore();

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const { user } = await api.getMe();
        setUser(user);
        return user;
      } catch {
        localStorage.removeItem('token');
        storeLogout();
        throw new Error('Not authenticated');
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!localStorage.getItem('token'),
  });

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: ({ user, token }) => {
      localStorage.setItem('token', token);
      setUser(user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: api.register,
    onSuccess: ({ user, token }) => {
      localStorage.setItem('token', token);
      setUser(user);
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: api.sendOtp,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: api.resetPassword,
  });

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Clear local session even if token is expired or invalid
    }
    localStorage.removeItem('token');
    storeLogout();
    queryClient.clear();
    navigate('/', { replace: true });
  };

  return {
    meQuery,
    loginMutation,
    registerMutation,
    sendOtpMutation,
    resetPasswordMutation,
    logout,
  };
}

export function useDocuments() {
  const { search, sortBy, sortOrder, filterPinned } = useDashboardStore();

  return useQuery({
    queryKey: ['documents', search, sortBy, sortOrder, filterPinned],
    queryFn: () =>
      api.getDocuments({
        ...(search && { search }),
        sortBy,
        sortOrder,
        ...(filterPinned && { pinnedOnly: 'true' }),
      }),
    select: (data) => data.documents,
  });
}

export function useRecentDocuments() {
  return useQuery({
    queryKey: ['documents', 'recent'],
    queryFn: () => api.getRecentDocuments(),
    select: (data) => data.documents,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => api.getDocument(id),
    select: (data) => data.document,
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options?: {
      title?: string;
      templateId?: string;
      seedContent?: import('../components/editor/PdfEmbed').TipTapContent | null;
    }) => api.createDocument(options),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useVersionHistory(documentId: string) {
  return useQuery({
    queryKey: ['versions', documentId],
    queryFn: () => api.getVersionHistory(documentId),
    enabled: !!documentId,
  });
}
