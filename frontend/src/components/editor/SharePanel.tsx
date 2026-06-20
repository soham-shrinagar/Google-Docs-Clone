import { useState, useEffect } from 'react';
import { Copy, Check, Link2, X, Users, Mail } from 'lucide-react';
import { api } from '../../lib/api';

interface SharePanelProps {
  documentId: string;
  onClose: () => void;
}

export function SharePanel({ documentId, onClose }: SharePanelProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
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
      const url = `${window.location.origin}/join/${token}`;
      setShareUrl(url);
      setSuccess('Share link created!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) {
      await handleCreateLink();
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareEmail = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await api.shareDocument(documentId, email.trim(), role);
      if (result.emailSent) {
        setSuccess(`Invite email sent to ${email.trim()} with a link to open the document.`);
      } else {
        setSuccess(
          `Shared with ${email.trim()}. Email not sent — add SMTP settings in .env to enable email invites.`
        );
      }
      setEmail('');
      const { collaborators: list } = await api.getCollaborators(documentId);
      setCollaborators(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Share failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-4 top-16 w-[min(calc(100vw-2rem),24rem)] bg-paper border border-line rounded-2xl shadow-xl z-50 p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <Users size={18} className="text-accent" /> Share document
        </h3>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-canvas text-muted hover:text-ink">
          <X size={16} />
        </button>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-muted uppercase tracking-wide">Share link</label>
        <p className="text-xs text-muted mb-2 mt-1">Anyone with the link can join as an editor (must be signed in).</p>
        <div className="flex gap-2 mt-1">
          <input
            readOnly
            value={shareUrl}
            placeholder="Click copy to generate link…"
            className="input-field flex-1 min-w-0 !py-2 text-xs bg-canvas truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            disabled={loading}
            className="btn-primary !px-3 !py-2 shrink-0"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        {!shareUrl && (
          <button
            type="button"
            onClick={handleCreateLink}
            disabled={loading}
            className="mt-2 flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <Link2 size={14} /> Generate share link
          </button>
        )}
      </div>

      <div className="border-t border-line pt-4 mb-4">
        <label className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1.5">
          <Mail size={12} /> Invite by email
        </label>
        <p className="text-xs text-muted mb-2 mt-1">
          We&apos;ll email them a direct link to open this document. New users can sign up via the link.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <input
            type="email"
            placeholder="collaborator@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field flex-1 min-w-0 !py-2"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field w-full sm:w-auto sm:min-w-[120px] !py-2"
          >
            <option value="EDITOR">Editor</option>
            <option value="COMMENTER">Commenter</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleShareEmail}
          disabled={loading || !email.trim()}
          className="btn-primary w-full mt-3 !py-2"
        >
          Send email invite
        </button>
      </div>

      {error && <p className="text-sm text-ink bg-canvas border border-line rounded-lg px-3 py-2 mb-2">{error}</p>}
      {success && <p className="text-sm text-accent bg-accent-soft rounded-lg px-3 py-2 mb-2">{success}</p>}

      {collaborators.length > 0 && (
        <div className="border-t border-line pt-3">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">People with access</p>
          <ul className="space-y-2 max-h-32 overflow-y-auto scroll-panel">
            {collaborators.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
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
        </div>
      )}
    </div>
  );
}
