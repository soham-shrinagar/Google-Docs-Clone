import { Link } from 'react-router-dom';
import { FileText, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '../../store';
import { useAuth } from '../../hooks/useApi';

export function Navbar() {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
          <FileText size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg">CollabDocs</span>
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-2">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium hidden sm:block">{user.name}</span>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      )}
    </nav>
  );
}
