import { useState, useEffect } from 'react';
import { getFeed } from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import ContentCard from '../components/ContentCard';
import { Loader2, Compass, ServerCrash } from 'lucide-react';
import { Link } from 'react-router-dom';

function FeedPage() {
  
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    
    if (isAuthenticated) {
      setLoading(true);
      setError(null);
      
      getFeed()
        .then(response => {
          setFeed(response);
        })
        .catch(err => {
          console.error("Failed to fetch feed:", err);
          setError("Could not load your feed. Please try again later.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]); // This effect depends on the user's login state.
  

  // Show a loading spinner while data is being fetched.
  if (loading) {
    return <div className="flex justify-center mt-16"><Loader2 className="animate-spin text-sky-500" size={48} /></div>;
  }

  
  if (error) {
    return (
      <div className="flex flex-col items-center text-center mt-16">
        <ServerCrash className="text-rose-500 mb-4" size={48} />
        <p className="text-xl text-slate-300">{error}</p>
      </div>
    );
  }
  
  // Prompt the user to log in if they are not authenticated.
  if (!isAuthenticated) {
    return (
      <div className="text-center py-16 text-slate-400 bg-slate-800 rounded-lg">
        <h2 className="text-2xl font-bold text-white">Your Feed is Waiting</h2>
        <p className="mt-2">Please <Link to="/login" className="text-sky-500 hover:underline">log in</Link> to see content from people you follow.</p>
      </div>
    );
  }

  // If everything is fine but the feed is empty, show the "empty" message.
  if (feed.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 bg-slate-800 rounded-lg">
        <Compass size={48} className="mx-auto" />
        <h3 className="mt-4 text-xl text-white font-bold">Your feed is empty</h3>
        <p>Follow other users to see their shared content here.</p>
      </div>
    );
  }

  // If everything is successful and there is content, render the feed.
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Your Feed</h1>
      <div className="space-y-6">
        {feed.map(item => <ContentCard key={item.id} item={item} showAuthor />)}
      </div>
    </div>
  );
}

export default FeedPage;