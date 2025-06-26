// import { Link } from 'react-router-dom';
// import { Lightbulb } from 'lucide-react';

// function Navbar() {
//   return (
//     <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
//             <Lightbulb className="text-sky-500" />
//             Showcase
//           </Link>
//           <div className="flex items-center gap-4">
//             <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
//               Log In
//             </Link>
//             <Link to="/register" className="text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 transition-colors px-4 py-2 rounded-md">
//               Sign Up
//             </Link>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }
// export default Navbar;



import { Link, useNavigate } from 'react-router-dom';
import { Lightbulb, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Lightbulb className="text-sky-500" />
            Showcase
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/feed" className="text-sm font-medium text-slate-300 hover:text-white">Feed</Link>
                <Link to={`/profile/${currentUser.username}`} className="text-sm font-medium text-slate-300 hover:text-white">My Profile</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-rose-500">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white">Log In</Link>
                <Link to="/register" className="text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-md">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;