import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { searchUsers } from '../api/apiClient';
import { Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FollowButton from '../components/FollowButton';

function SearchPage() {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchUsers(query);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="text-center py-16 text-slate-400 bg-slate-800 rounded-lg">
            <h2 className="text-2xl font-bold text-white">Discover Users</h2>
            <p className="mt-2">Please <Link to="/login" className="text-sky-500 hover:underline">log in</Link> to search for and follow other users.</p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Find Users</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 pl-10 focus:ring-sky-500 focus:border-sky-500"
            />
        </div>
        <button type="submit" disabled={loading} className="font-bold py-3 px-6 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:bg-slate-600">
            {loading ? <Loader2 className="animate-spin" /> : 'Search'}
        </button>
      </form>

      <div>
        {loading && <p className="text-slate-400">Searching...</p>}
        {!loading && searched && results.length === 0 && <p className="text-slate-400">No users found for "{query}".</p>}
        
        <div className="space-y-4">
          {results.map(user => (
            <div key={user.username} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div>
                    <Link to={`/profile/${user.username}`} className="text-lg font-bold text-white hover:text-sky-500">
                        {user.username}
                    </Link>
                    <p className="text-sm text-slate-400">{user.followers_count} Followers</p>
                </div>
                <FollowButton 
                    usernameToFollow={user.username} 
                    initialIsFollowing={user.is_followed_by_current_user}
                />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;