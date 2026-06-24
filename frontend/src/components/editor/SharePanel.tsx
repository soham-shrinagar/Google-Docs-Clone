import { useState, useEffect } from 'react';
import { Copy, Check, Link2, X, Users, Mail, Loader2, Send } from 'lucide-react';
import { api } from '../../lib/api';

interface SharePanelProps {
  documentId: string;
  onClose: () => void;
}

const ROLES = [
  { value: 'EDITOR', label: 'Editor', desc: 'Can edit the document' },
  { value: 'COMMENTER', label: 'Commenter', desc: 'Can view and comment' },
  { value: 'VIEWER', label: 'Viewer', desc: 'Can view only' },
] as const;

export function SharePanel({ documentId, onClose }: SharePanelProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<
    Array<{ id: string; name: string; email: string; color: string; role: string }>
  >([]);

  useEffect(() => {
    api.getCollaborators(documentId).then(({ collaborators: list, shareToken }) => {
      setCollaborators(list);
      if (shareToken) {
        setShareUrl(`${window.location.origin}/join/${shareToken}`);
      }
    }).catch(() => { /* ignore */ });
  }, [documentId]);

  const handleCreateLink = async () => {
    setLoading(true);
    setError('');
    try {
      const { token } = await api.createShareLink(documentId);
      setShareUrl(`${window.location.origin}/join/${token}`);
      setSuccess('Share link ready — copy or send via email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    let url = shareUrl;
    if (!url) {
      setLoading(true);
      try {
        const { token } = await api.createShareLink(documentId);
        url = `${window.location.origin}/join/${token}`;
        setShareUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create link');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareEmail = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setEmailLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await api.shareDocument(
        documentId,
        trimmed,
        role,
        window.location.origin
      );
      if (result.docUrl) {
        setShareUrl(result.docUrl);
      }
      if (result.emailSent) {
        setSuccess(`Invite sent to ${trimmed}`);
        setEmail('');
      } else {
        setError(
          `Could not deliver email to ${trimmed}. Copy the share link above and send it manually.`
        );
      }
      const { collaborators: list } = await api.getCollaborators(documentId);
      setCollaborators(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Share failed');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="fixed right-4 top-14 w-[min(calc(100vw-2rem),22rem)] sm:w-[min(calc(100vw-2rem),28rem)] surface-card z-50 animate-fade-up overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <Users size={18} className="text-accent" /> Share
        </h3>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-canvas text-muted hover:text-ink">
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto scroll-panel">
        <section>
          <label className="text-xs font-medium text-muted uppercase tracking-wide">Share link</label>
          <p className="text-xs text-muted mt-1 mb-2">Anyone with this link can join after signing in.</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              placeholder="Generate a link to share…"
              className="input-field flex-1 min-w-0 !py-2 text-xs bg-canvas truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              disabled={loading}
              className="btn-secondary !px-3 shrink-0"
              title="Copy link"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          {!shareUrl && (
            <button
              type="button"
              onClick={handleCreateLink}
              disabled={loading}
              className="mt-2 flex items-center gap-1.5 text-sm text-accent hover:underline"
            >
              <Link2 size={14} /> Generate link
            </button>
          )}
        </section>

        <section className="border-t border-line pt-5">
          <div className="flex items-center gap-2 mb-1">
            <Mail size={14} className="text-accent" />
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Invite by email</label>
          </div>
          <p className="text-xs text-muted mb-3">
            We&apos;ll send them a link to open this document directly.
          </p>

          <div className="space-y-2">
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !emailLoading && email.trim() && handleShareEmail()}
              className="input-field w-full text-sm"
              autoComplete="email"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field w-full text-sm"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleShareEmail}
            disabled={emailLoading || !email.trim()}
            className="btn-primary w-full mt-3 !h-10 flex items-center justify-center gap-2"
          >
            {emailLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Send invite
          </button>
        </section>

        {error && (
          <div className="text-sm text-ink bg-canvas border border-line rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm rounded-xl px-3.5 py-2.5 bg-accent-soft border border-accent/20 text-ink flex items-start gap-2">
            <Check size={16} className="text-accent shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {collaborators.length > 0 && (
          <section className="border-t border-line pt-4">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">People with access</p>
            <ul className="space-y-2 max-h-36 overflow-y-auto scroll-panel">
              {collaborators.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-ink">{c.name}</p>
                    <p className="text-xs text-muted truncate">{c.email}</p>
                  </div>
                  <span className="text-xs text-muted capitalize shrink-0">{c.role.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
