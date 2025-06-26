// import { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { Loader2, ServerCrash } from 'lucide-react';
// import ContentCard from '../components/ContentCard';

// const API_BASE_URL = "http://localhost:8000";

// function ProfilePage() {
//   const { username } = useParams();
//   const [content, setContent] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchContent = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`${API_BASE_URL}/users/${username}/content`);
//         setContent(response.data);
//         setError(null);
//       } catch (err) {
//         setError('Could not fetch content. The profile might not exist.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchContent();
//   }, [username]);

//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-white mb-2">Reading & Watch List</h1>
//       <p className="text-lg text-slate-400 mb-8">An intellectual footprint of <span className="font-semibold text-sky-500">{username}</span></p>

//       {loading && (
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="animate-spin text-sky-500" size={48} />
//         </div>
//       )}

//       {error && !loading && (
//         <div className="flex flex-col items-center justify-center h-64 bg-slate-800 rounded-lg">
//             <ServerCrash className="text-rose-500 mb-4" size={48} />
//             <p className="text-xl text-slate-300">{error}</p>
//         </div>
//       )}

//       {!loading && !error && (
//         <div className="space-y-6">
//           {content.length > 0 ? (
//             content.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map((item) => <ContentCard key={item.url} item={item} />)
//           ) : (
//             <div className="text-center py-16 text-slate-500">
//                 <p>This list is empty.</p>
//                 <p className="text-sm">{username} hasn't shared anything yet.</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
// export default ProfilePage;


import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfile, getContentForUser } from '../api/apiClient';
import { Loader2, ServerCrash } from 'lucide-react';
import ContentCard from '../components/ContentCard';
import ProfileHeader from '../components/ProfileHeader'; // Import

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
        const profileRes = await getUserProfile(username);
        const contentRes = await getContentForUser(username);
        setProfile(profileRes.data);
        setContent(contentRes.data);
      } catch (err) {
        setError('Could not fetch profile. The user might not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [username]);
  
  // ... (return JSX is updated to use ProfileHeader)
  return (
    <div>
      {loading && <div className="flex justify-center mt-16"><Loader2 className="animate-spin text-sky-500" size={48} /></div>}
      
      {error && !loading && (
        <div className="flex flex-col items-center text-center mt-16">
          <ServerCrash className="text-rose-500 mb-4" size={48} />
          <p className="text-xl text-slate-300">{error}</p>
        </div>
      )}

      {!loading && !error && profile && (
        <>
          <ProfileHeader profile={profile} />
          <div className="space-y-6">
            {content.length > 0 ? (
              content.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map((item) => <ContentCard key={item.url} item={item} />)
            ) : (
              <div className="text-center py-16 text-slate-500 bg-slate-800 rounded-lg">
                <p>This list is empty.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
export default ProfilePage;