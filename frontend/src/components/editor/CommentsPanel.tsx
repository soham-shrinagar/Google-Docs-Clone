import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Editor } from '@tiptap/react';
import { MessageSquare, X, Check, RotateCcw } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

interface CommentsPanelProps {
  documentId: string;
  editor: Editor | null;
  canComment: boolean;
  onClose: () => void;
}

export function CommentsPanel({ documentId, editor, canComment, onClose }: CommentsPanelProps) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [quote, setQuote] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['comments', documentId],
    queryFn: () => api.getComments(documentId),
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { content: string; quote?: string; parentId?: string }) =>
      api.createComment(documentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', documentId] });
      setDraft('');
      setQuote('');
      setReplyTo(null);
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ commentId, resolved }: { commentId: string; resolved: boolean }) =>
      api.resolveComment(documentId, commentId, resolved),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', documentId] }),
  });

  const captureSelection = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;
    setQuote(editor.state.doc.textBetween(from, to, ' '));
  };

  const comments = data?.comments ?? [];

  return (
    <aside className="side-panel" aria-label="Comments">
      <div className="side-panel-header">
        <h3 className="side-panel-title">
          <MessageSquare size={15} className="text-muted" /> Comments
        </h3>
        <button type="button" onClick={onClose} className="btn-ghost p-1!" aria-label="Close comments">
          <X size={15} />
        </button>
      </div>

      {canComment && (
        <div className="p-4 border-b border-line space-y-2">
          {quote && (
            <blockquote className="text-xs text-muted border-l-2 border-accent pl-2 italic truncate">
              &ldquo;{quote}&rdquo;
              <button type="button" className="ml-2 text-accent" onClick={() => setQuote('')}>×</button>
            </blockquote>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={replyTo ? 'Write a reply…' : 'Add a comment…'}
            className="input-field !py-2 min-h-[72px] resize-none text-sm"
            rows={3}
          />
          <div className="flex gap-2">
            <button type="button" className="btn-secondary !py-1.5 !px-3 !text-xs flex-1" onClick={captureSelection}>
              Quote selection
            </button>
            <button
              type="button"
              className="btn-primary !py-1.5 !px-3 !text-xs flex-1"
              disabled={!draft.trim() || createMutation.isPending}
              onClick={() =>
                createMutation.mutate({
                  content: draft,
                  quote: quote || undefined,
                  parentId: replyTo || undefined,
                })
              }
            >
              {replyTo ? 'Reply' : 'Comment'}
            </button>
          </div>
          {replyTo && (
            <button type="button" className="text-xs text-muted hover:text-ink" onClick={() => setReplyTo(null)}>
              Cancel reply
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scroll-panel p-3 space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-muted px-2">No comments yet. Select text and add feedback.</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl border p-3 ${c.resolved ? 'border-line/60 bg-canvas/50 opacity-70' : 'border-line bg-paper'}`}
            >
              <div className="flex items-start gap-2">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
                  style={{ backgroundColor: c.user.color }}
                >
                  {c.user.name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{c.user.name}</p>
                    <span className="text-[10px] text-muted shrink-0">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {c.quote && (
                    <p className="text-xs text-muted border-l-2 border-accent/40 pl-2 mt-1 italic line-clamp-2">
                      {c.quote}
                    </p>
                  )}
                  <p className="text-sm text-ink mt-1.5 whitespace-pre-wrap">{c.content}</p>
                  <div className="flex gap-2 mt-2">
                    {canComment && (
                      <button type="button" className="text-xs text-accent hover:underline" onClick={() => setReplyTo(c.id)}>
                        Reply
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-xs text-muted hover:text-ink flex items-center gap-1"
                      onClick={() => resolveMutation.mutate({ commentId: c.id, resolved: !c.resolved })}
                    >
                      {c.resolved ? <><RotateCcw size={12} /> Reopen</> : <><Check size={12} /> Resolve</>}
                    </button>
                  </div>
                  {c.replies?.map((r) => (
                    <div key={r.id} className="mt-3 pl-3 border-l border-line">
                      <p className="text-xs font-medium text-ink">{r.user.name}</p>
                      <p className="text-sm text-ink mt-0.5">{r.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
