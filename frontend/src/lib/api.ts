const API_URL = import.meta.env.VITE_API_URL || '';

export function getGoogleAuthUrl(): string {
  const base = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/api/auth/google`;
}

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

  completeOAuthSession() {
    return request<{ user: import('../types').User; token: string }>(API_URL, '/api/auth/session');
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
    documentType?: import('../types').DocumentType;
    workspaceMeta?: Record<string, unknown> | null;
  }) {
    return request<{ document: import('../types').Document }>(API_URL, '/api/documents', {
      method: 'POST',
      body: JSON.stringify(options ?? {}),
    });
  },

  createWorkspace(options: {
    title: string;
    seed: {
      pages: import('../lib/workspace/types').WorkspacePageData[];
      elements?: import('../lib/workspace/types').WorkspaceElementData[];
      sourceAsset?: {
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        url: string;
      };
    };
  }) {
    return request<{ document: import('../types').Document }>(API_URL, '/api/workspace', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },

  getWorkspaceMeta(documentId: string) {
    return request<{ pages: unknown[]; assets: unknown[] }>(API_URL, `/api/workspace/${documentId}/meta`);
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
    return request<{ permission: unknown; emailSent: boolean; docUrl: string }>(
      API_URL,
      `/api/documents/${id}/share`,
      {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      }
    );
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

  getComments(documentId: string) {
    return request<{ comments: import('../types').DocumentComment[] }>(
      API_URL,
      `/api/documents/${documentId}/comments`
    );
  },

  createComment(documentId: string, data: { content: string; quote?: string; parentId?: string }) {
    return request<{ comment: import('../types').DocumentComment }>(
      API_URL,
      `/api/documents/${documentId}/comments`,
      { method: 'POST', body: JSON.stringify(data) }
    );
  },

  resolveComment(documentId: string, commentId: string, resolved: boolean) {
    return request<{ comment: import('../types').DocumentComment }>(
      API_URL,
      `/api/documents/${documentId}/comments/${commentId}`,
      { method: 'PATCH', body: JSON.stringify({ resolved }) }
    );
  },

  aiRewrite(documentId: string, data: { text: string; action: import('./aiTypes').AiRewriteAction; targetLanguage?: string }) {
    return request<{ result: string; rewriteId: string; requestId: string }>(
      API_URL,
      `/api/documents/${documentId}/ai/rewrite`,
      { method: 'POST', body: JSON.stringify(data) }
    );
  },

  aiRewriteOutcome(documentId: string, rewriteId: string, accepted: boolean) {
    return request(API_URL, `/api/documents/${documentId}/ai/rewrite/${rewriteId}/outcome`, {
      method: 'POST',
      body: JSON.stringify({ accepted }),
    });
  },

  aiGrammarCheck(documentId: string, text: string) {
    return request<{ issues: import('./aiTypes').GrammarIssue[] }>(
      API_URL,
      `/api/documents/${documentId}/ai/grammar`,
      { method: 'POST', body: JSON.stringify({ text }) }
    );
  },

  aiSpellCheck(documentId: string, text: string) {
    return request<{ issues: import('./aiTypes').SpellIssue[] }>(
      API_URL,
      `/api/documents/${documentId}/ai/spell-check`,
      { method: 'POST', body: JSON.stringify({ text }) }
    );
  },

  addDictionaryWord(word: string) {
    return request<{ word: string }>(API_URL, '/api/ai/dictionary', {
      method: 'POST',
      body: JSON.stringify({ word }),
    });
  },

  aiSummarize(documentId: string, data: { text: string; format: import('./aiTypes').SummaryFormat }) {
    return request<{ summary: string; format: string }>(
      API_URL,
      `/api/documents/${documentId}/ai/summarize`,
      { method: 'POST', body: JSON.stringify(data) }
    );
  },

  aiChat(documentId: string, data: {
    question: string;
    documentText: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  }) {
    return request<{ answer: string }>(
      API_URL,
      `/api/documents/${documentId}/ai/chat`,
      { method: 'POST', body: JSON.stringify(data) }
    );
  },

  aiInsights(documentId: string, data: { text: string; structure?: Record<string, number> }) {
    return request<{ insights: Record<string, unknown> }>(
      API_URL,
      `/api/documents/${documentId}/ai/insights`,
      { method: 'POST', body: JSON.stringify(data) }
    );
  },

  aiSaveTranscript(documentId: string, data: {
    transcript: string;
    language: string;
    insertMode: string;
    durationMs?: number;
  }) {
    return request(API_URL, `/api/documents/${documentId}/ai/speech/transcript`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  aiVoiceCommand(documentId: string, transcript: string) {
    return request<{ isCommand: boolean; action: string | null; payload: Record<string, unknown> }>(
      API_URL,
      `/api/documents/${documentId}/ai/voice-command`,
      { method: 'POST', body: JSON.stringify({ transcript }) }
    );
  },

  aiGrammarOutcome(accepted: boolean) {
    return request(API_URL, '/api/ai/grammar/outcome', {
      method: 'POST',
      body: JSON.stringify({ accepted }),
    });
  },

  aiUsageStats() {
    return request<{
      totals: Record<string, number>;
      daily: Array<Record<string, number | string>>;
      recentRequests: Array<{
        id: string;
        type: string;
        action: string | null;
        status: string;
        createdAt: string;
        documentId: string | null;
      }>;
    }>(API_URL, '/api/ai/usage');
  },
};
