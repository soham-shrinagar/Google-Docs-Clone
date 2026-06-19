const API_URL = import.meta.env.VITE_API_URL || '';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(baseUrl: string, endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options;
  let url = `${baseUrl}${endpoint}`;
  if (params) {
    url += '?' + new URLSearchParams(params).toString();
  }

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  register(data: { email: string; password: string; name: string }) {
    return request<{ user: import('../types').User; token: string }>(API_URL, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login(data: { email: string; password: string }) {
    return request<{ user: import('../types').User; token: string }>(API_URL, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe() {
    return request<{ user: import('../types').User }>(API_URL, '/api/auth/me');
  },

  logout() {
    return request(API_URL, '/api/auth/logout', { method: 'POST' });
  },

  getDocuments(params?: Record<string, string>) {
    return request<{ documents: import('../types').Document[] }>(API_URL, '/api/documents', { params });
  },

  getRecentDocuments() {
    return request<{ documents: import('../types').Document[] }>(API_URL, '/api/documents/recent');
  },

  createDocument(options?: {
    title?: string;
    templateId?: string;
    seedContent?: import('../components/editor/PdfEmbed').TipTapContent | null;
  }) {
    return request<{ document: import('../types').Document }>(API_URL, '/api/documents', {
      method: 'POST',
      body: JSON.stringify(options ?? {}),
    });
  },

  getTemplates() {
    return request<{ templates: import('../lib/templates').DocumentTemplate[] }>(
      API_URL,
      '/api/templates'
    );
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/api/uploads`, {
      method: 'POST',
      credentials: 'include',
      headers: authHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    return res.json() as Promise<{
      url: string;
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      type: 'pdf' | 'image';
    }>;
  },

  getDocument(id: string) {
    return request<{ document: import('../types').Document }>(API_URL, `/api/documents/${id}`);
  },

  updateDocument(id: string, data: { title: string }) {
    return request<{ document: import('../types').Document }>(API_URL, `/api/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteDocument(id: string) {
    return request(API_URL, `/api/documents/${id}`, { method: 'DELETE' });
  },

  shareDocument(id: string, email: string, role: string) {
    return request(API_URL, `/api/documents/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  createShareLink(id: string) {
    return request<{ token: string; url: string }>(API_URL, `/api/documents/${id}/share-link`, {
      method: 'POST',
    });
  },

  getCollaborators(id: string) {
    return request<{
      collaborators: Array<{
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        color: string;
        role: string;
      }>;
      shareToken: string | null;
    }>(API_URL, `/api/documents/${id}/collaborators`);
  },

  joinByShareToken(token: string) {
    return request<{ document: import('../types').Document }>(API_URL, `/api/documents/join/${token}`, {
      method: 'POST',
    });
  },

  togglePin(id: string) {
    return request<{ pinned: boolean }>(API_URL, `/api/documents/${id}/pin`, { method: 'POST' });
  },

  getVersionHistory(documentId: string) {
    return request<{
      versions: import('../types').DocumentVersion[];
      operations: import('../types').DocumentOperation[];
    }>(API_URL, `/api/documents/${documentId}/versions/history`);
  },

  restoreVersion(documentId: string, versionId: string) {
    return request<{ state: number[] }>(
      API_URL,
      `/api/documents/${documentId}/versions/restore/${versionId}`,
      { method: 'POST' }
    );
  },

  reconstructAtTimestamp(documentId: string, timestamp: string) {
    return request<{ state: number[] }>(API_URL, `/api/documents/${documentId}/versions/reconstruct`, {
      params: { timestamp },
    });
  },

  getPresence(documentId: string) {
    return request<{ presence: import('../types').PresenceUser[] }>(
      API_URL,
      `/api/documents/${documentId}/presence`
    );
  },

  getNotifications() {
    return request<{ notifications: import('../types').Notification[] }>(API_URL, '/api/notifications');
  },

  markNotificationRead(id: string) {
    return request(API_URL, `/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  getAnalytics() {
    return request<import('../types').AnalyticsMetrics>(API_URL, '/api/notifications/analytics');
  },
};
