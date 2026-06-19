import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store';
import { useDashboardStore } from '../store';

export function useAuth() {
  const { setUser, logout: storeLogout } = useAuthStore();

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { user } = await api.getMe();
      setUser(user);
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
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

  const logout = async () => {
    await api.logout();
    localStorage.removeItem('token');
    storeLogout();
  };

  return { meQuery, loginMutation, registerMutation, logout };
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
    mutationFn: (options?: { title?: string; templateId?: string }) =>
      api.createDocument(options),
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

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(),
    refetchInterval: 3000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
    select: (data) => data.notifications,
    refetchInterval: 10000,
  });
}
