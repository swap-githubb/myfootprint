import { useState, useEffect } from 'react';
import { getFeed } from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import ContentCard from '../components/ContentCard';
import { Loader2, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

function FeedPage() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      getFeed()
        .then(response => setFeed(response.data))
        .catch(err => console.error("Failed to fetch feed:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white">Your Feed is Waiting</h2>
        <p className="text-slate-400 mt-2">Please <Link to="/login" className="text-sky-500 hover:underline">log in</Link> to see content from people you follow.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center mt-16"><Loader2 className="animate-spin text-sky-500" size={48} /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Your Feed</h1>
      {feed.length > 0 ? (
        <div className="space-y-6">
          {feed.map(item => <ContentCard key={item.url} item={item} showAuthor />)}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500 bg-slate-800 rounded-lg">
          <Compass size={48} className="mx-auto" />
          <h3 className="mt-4 text-xl text-white font-bold">Your feed is empty</h3>
          <p>Follow other users to see their shared content here.</p>
        </div>
      )}
    </div>
  );
}
export default FeedPage;