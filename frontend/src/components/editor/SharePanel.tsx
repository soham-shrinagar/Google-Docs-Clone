import { useState, useEffect } from 'react';
import { Copy, Check, Link2, X, Users } from 'lucide-react';
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
      await api.shareDocument(documentId, email.trim(), role);
      setSuccess(`Shared with ${email}`);
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
    <div className="fixed right-4 top-16 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users size={18} /> Share document
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
          <X size={16} />
        </button>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Share link</label>
        <p className="text-xs text-gray-400 mb-2">Anyone with the link can join as an editor (must be signed in).</p>
        <div className="flex gap-2 mt-1">
          <input
            readOnly
            value={shareUrl}
            placeholder="Click copy to generate link..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 truncate"
          />
          <button
            onClick={handleCopy}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        {!shareUrl && (
          <button
            onClick={handleCreateLink}
            disabled={loading}
            className="mt-2 flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
          >
            <Link2 size={14} /> Generate share link
          </button>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4 mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Invite by email</label>
        <p className="text-xs text-gray-400 mb-2">Recipient must already have a CollabDocs account.</p>
        <div className="flex gap-2 mt-1">
          <input
            type="email"
            placeholder="collaborator@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="EDITOR">Editor</option>
            <option value="COMMENTER">Commenter</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
        <button
          onClick={handleShareEmail}
          disabled={loading || !email.trim()}
          className="mt-2 w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          Send invite
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-2">{success}</p>}

      {collaborators.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">People with access</p>
          <ul className="space-y-2 max-h-32 overflow-y-auto">
            {collaborators.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.email}</p>
                </div>
                <span className="text-xs text-gray-500 capitalize">{c.role.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
