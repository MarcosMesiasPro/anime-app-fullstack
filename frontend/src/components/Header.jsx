import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎌</span>
            <span className="text-xl font-bold text-white">AnimeHub</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition"
            >
              Browse
            </Link>
            <Link
              to="/favorites"
              className="text-gray-300 hover:text-white transition"
            >
              Favorites
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4 pl-4 border-l border-gray-700">
              <Link
                to={`/profile/${user?._id}`}
                className="flex items-center space-x-2 hover:opacity-80 transition"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-300">{user?.name}</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 rounded transition"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;