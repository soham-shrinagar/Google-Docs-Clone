import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Pin, Users, Clock, MoreVertical, Trash2 } from 'lucide-react';
import type { Document } from '../../types';
import clsx from 'clsx';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
}

const permissionColors: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  EDITOR: 'bg-blue-100 text-blue-700',
  COMMENTER: 'bg-yellow-100 text-yellow-700',
  VIEWER: 'bg-gray-100 text-gray-600',
};

export function DocumentCard({ document, onDelete, onPin }: DocumentCardProps) {
  return (
    <Link
      to={`/document/${document.id}`}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all"
    >
      <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative">
        {document.thumbnail ? (
          <img src={document.thumbnail} alt="" className="w-full h-full object-cover rounded" />
        ) : (
          <div className="text-gray-400 text-sm line-clamp-6 leading-relaxed">
            <div className="w-full h-2 bg-gray-200 rounded mb-2" />
            <div className="w-3/4 h-2 bg-gray-200 rounded mb-2" />
            <div className="w-5/6 h-2 bg-gray-200 rounded mb-2" />
            <div className="w-2/3 h-2 bg-gray-200 rounded" />
          </div>
        )}
        {document.isPinned && (
          <Pin size={14} className="absolute top-3 right-3 text-brand-500 fill-brand-500" />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
            {document.title}
          </h3>
          <div className="relative group/menu">
            <button
              onClick={(e) => e.preventDefault()}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded"
            >
              <MoreVertical size={16} />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 hidden group-hover/menu:block z-10 w-36">
              <button
                onClick={(e) => { e.preventDefault(); onPin(document.id); }}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Pin size={14} /> {document.isPinned ? 'Unpin' : 'Pin'}
              </button>
              {document.permission === 'OWNER' && (
                <button
                  onClick={(e) => { e.preventDefault(); onDelete(document.id); }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-1">{document.owner.name}</p>

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Users size={12} /> {document.collaboratorCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', permissionColors[document.permission])}>
            {document.permission}
          </span>
          {document.recentActivity[0] && (
            <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
              {document.recentActivity[0].user.name} {document.recentActivity[0].type.toLowerCase()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
