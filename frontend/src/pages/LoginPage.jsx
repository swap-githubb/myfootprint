import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../api/apiClient';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Call the API to get the token
      const data = await loginUser({ username, password });
      
      // 2. Pass the token to the context to update the state
      login(data.access_token);
      
      // 3. Navigate to the profile page
      navigate(`/profile/${username}`);

    } catch (err) {
      // This will now correctly catch actual API errors (like 401)
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg border border-slate-700">
        <h1 className="text-2xl font-bold text-center text-white">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block mb-2 text-sm font-medium text-slate-300">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2.5 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2.5 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          {error && <p className="text-sm text-rose-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-sky-800 disabled:bg-slate-600"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Log In'}
          </button>
          <p className="text-sm text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-sky-500 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;