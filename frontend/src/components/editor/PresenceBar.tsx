import type { PresenceUser } from '../../types';

interface PresenceBarProps {
  users: PresenceUser[];
}

export function PresenceBar({ users }: PresenceBarProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 mr-1">Editing:</span>
      <div className="flex -space-x-2">
        {users.map((user) => (
          <div key={user.userId} className="relative group" title={user.name}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-white"
                style={{ boxShadow: `0 0 0 2px ${user.color}` }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {user.isTyping && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {user.name}
              {user.isTyping && ' (typing...)'}
            </div>
          </div>
        ))}
      </div>
      <span className="text-xs text-gray-400">
        {users.length} active
      </span>
    </div>
  );
}
