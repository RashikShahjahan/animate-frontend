import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-pink-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home" className="text-xl font-bold">Animation Studio</Link>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.username || user?.email}</span>
            <button 
              onClick={logout}
              className="bg-pink-700 hover:bg-pink-800 px-4 py-2 rounded-md text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link 
              to="/login" 
              className="text-white hover:text-pink-200 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-pink-700 hover:bg-pink-800 px-4 py-2 rounded-md text-sm transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 