import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFollowers } from '../api/apiClient';
import UserList from '../components/UserList';
import { Loader2 } from 'lucide-react';

function FollowersPage() {
  const { username } = useParams();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      getFollowers(username)
        .then(data => setFollowers(data))
        .catch(err => console.error("Failed to fetch followers list", err))
        .finally(() => setLoading(false));
    }
  }, [username]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">
        <Link to={`/profile/${username}`} className="text-sky-500 hover:underline">{username}</Link>
        <span className="text-slate-400"> / Followers</span>
      </h1>

      {loading ? (
        <div className="flex justify-center mt-16"><Loader2 className="animate-spin text-sky-500" size={48} /></div>
      ) : (
        <UserList users={followers} emptyMessage={`${username} has no followers.`} />
      )}
    </div>
  );
}

export default FollowersPage;