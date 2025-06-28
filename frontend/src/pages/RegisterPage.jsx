import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/apiClient';
import { Loader2 } from 'lucide-react';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await registerUser({ username, email, password });
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg border border-slate-700">
        <h1 className="text-2xl font-bold text-center text-white">Create an Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block mb-2 text-sm font-medium text-slate-300">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2.5 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-300">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2.5 focus:ring-sky-500 focus:border-sky-500" />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-300">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2.5 focus:ring-sky-500 focus:border-sky-500" />
          </div>

          {error && <p className="text-sm text-rose-500 text-center">{error}</p>}
          {success && <p className="text-sm text-emerald-500 text-center">{success}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-sky-800 disabled:bg-slate-600"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
          </button>
          <p className="text-sm text-center text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-sky-500 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;