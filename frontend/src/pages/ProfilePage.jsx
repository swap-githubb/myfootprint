import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfile, getContentForUser } from '../api/apiClient';
import { Loader2, ServerCrash } from 'lucide-react';
import ContentCard from '../components/ContentCard';
import ProfileHeader from '../components/ProfileHeader';

function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use Promise.all to fetch profile and content data in parallel for speed.
        const [profileResponse, contentResponse] = await Promise.all([
          getUserProfile(username),
          getContentForUser(username)
        ]);
        
        setProfile(profileResponse); // The whole response.data is the profile object
        setContent(contentResponse); // The whole response.data is the content array

      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        setError('Could not fetch profile. The user might not exist or there was a server error.');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch data if a username is present in the URL.
    if (username) {
      fetchAllData();
    }
  }, [username]); // This effect re-runs whenever the username in the URL changes.
  
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

  // Render the content if everything is successful
  return (
    <div>
      <ProfileHeader profile={profile} />
      <div className="space-y-6">
        {content && content.length > 0 ? (
          // Sort by date and map over the items to render them
          content
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((item) => <ContentCard key={item.id} item={item} />)
        ) : (
          <div className="text-center py-16 text-slate-500 bg-slate-800 rounded-lg">
            <p className="text-xl font-semibold text-white">This list is empty.</p>
            <p>{username} hasn't shared anything yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;