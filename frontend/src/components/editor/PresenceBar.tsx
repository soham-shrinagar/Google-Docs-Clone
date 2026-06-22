import type { PresenceUser } from '../../types';

interface PresenceBarProps {
  users: PresenceUser[];
}

export function PresenceBar({ users }: PresenceBarProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {users.slice(0, 5).map((user) => (
          <div key={user.userId} className="relative group" title={user.name}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-md border border-paper object-cover"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-md border border-paper flex items-center justify-center text-white text-[10px] font-medium"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {user.isTyping && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-paper" />
            )}
          </div>
        ))}
      </div>
      {users.length > 5 && (
        <span className="text-xs text-muted">+{users.length - 5}</span>
      )}
    </div>
  );
}
