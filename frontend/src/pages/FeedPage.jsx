// import { useState, useEffect } from 'react';
// import { getFeed } from '../api/apiClient';
// import { useAuth } from '../contexts/AuthContext';
// import ContentCard from '../components/ContentCard';
// import { Loader2, Compass } from 'lucide-react';
// import { Link } from 'react-router-dom';

// function FeedPage() {
//   const [feed, setFeed] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { isAuthenticated } = useAuth();

//   useEffect(() => {
//     if (isAuthenticated) {
//       getFeed()
//         .then(response => setFeed(response.data))
//         .catch(err => console.error("Failed to fetch feed:", err))
//         .finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, [isAuthenticated]);
  
//   if (!isAuthenticated) {
//     return (
//       <div className="text-center py-16">
//         <h2 className="text-2xl font-bold text-white">Your Feed is Waiting</h2>
//         <p className="text-slate-400 mt-2">Please <Link to="/login" className="text-sky-500 hover:underline">log in</Link> to see content from people you follow.</p>
//       </div>
//     );
//   }

//   if (loading) {
//     return <div className="flex justify-center mt-16"><Loader2 className="animate-spin text-sky-500" size={48} /></div>;
//   }

//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-white mb-8">Your Feed</h1>
//       {feed.length > 0 ? (
//         <div className="space-y-6">
//           {feed.map(item => <ContentCard key={item.url} item={item} showAuthor />)}
//         </div>
//       ) : (
//         <div className="text-center py-16 text-slate-500 bg-slate-800 rounded-lg">
//           <Compass size={48} className="mx-auto" />
//           <h3 className="mt-4 text-xl text-white font-bold">Your feed is empty</h3>
//           <p>Follow other users to see their shared content here.</p>
//         </div>
//       )}
//     </div>
//   );
// }
// export default FeedPage;


import { useState, useEffect } from 'react';
import { getFeed } from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import ContentCard from '../components/ContentCard';
import { Loader2, Compass, ServerCrash } from 'lucide-react';
import { Link } from 'react-router-dom';

function FeedPage() {
  // Initialize state correctly to prevent crashes.
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only attempt to fetch the feed if the user is authenticated.
    if (isAuthenticated) {
      setLoading(true);
      setError(null);
      
      getFeed()
        .then(response => {
          // The API client now returns the data directly.
          setFeed(response);
        })
        .catch(err => {
          console.error("Failed to fetch feed:", err);
          // Set a user-friendly error message.
          setError("Could not load your feed. Please try again later.");
        })
        .finally(() => {
          // Always stop loading, regardless of success or failure.
          setLoading(false);
        });
    } else {
      // If not authenticated, we're not loading anything.
      setLoading(false);
    }
  }, [isAuthenticated]); // This effect depends on the user's login state.
  
  // --- Conditional Rendering Logic ---

  // 1. Show a loading spinner while data is being fetched.
  if (loading) {
    return <div className="flex justify-center mt-16"><Loader2 className="animate-spin text-sky-500" size={48} /></div>;
  }

  // 2. Show a clear error message if the API call failed.
  if (error) {
    return (
      <div className="flex flex-col items-center text-center mt-16">
        <ServerCrash className="text-rose-500 mb-4" size={48} />
        <p className="text-xl text-slate-300">{error}</p>
      </div>
    );
  }
  
  // 3. Prompt the user to log in if they are not authenticated.
  if (!isAuthenticated) {
    return (
      <div className="text-center py-16 text-slate-400 bg-slate-800 rounded-lg">
        <h2 className="text-2xl font-bold text-white">Your Feed is Waiting</h2>
        <p className="mt-2">Please <Link to="/login" className="text-sky-500 hover:underline">log in</Link> to see content from people you follow.</p>
      </div>
    );
  }

  // 4. If everything is fine but the feed is empty, show the "empty" message.
  if (feed.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 bg-slate-800 rounded-lg">
        <Compass size={48} className="mx-auto" />
        <h3 className="mt-4 text-xl text-white font-bold">Your feed is empty</h3>
        <p>Follow other users to see their shared content here.</p>
        {/* You could add a link to a "discover users" page here in the future */}
      </div>
    );
  }

  // 5. If everything is successful and there is content, render the feed.
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