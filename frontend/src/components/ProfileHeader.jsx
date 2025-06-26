import FollowButton from './FollowButton';
import { useAuth } from '../contexts/AuthContext';

function ProfileHeader({ profile }) {
  const { currentUser } = useAuth();
  
  if (!profile) return null;

  return (
    <div className="mb-10 p-6 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
          <div className="flex items-center gap-4 mt-2 text-slate-400">
            <span><strong className="text-white">{profile.following_count}</strong> Following</span>
            <span><strong className="text-white">{profile.followers_count}</strong> Followers</span>
          </div>
        </div>
        <div>
          {currentUser && currentUser.username !== profile.username && (
            <FollowButton 
              usernameToFollow={profile.username}
              initialIsFollowing={profile.is_followed_by_current_user}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;