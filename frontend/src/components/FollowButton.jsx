import { useState } from 'react';
import { followUser, unfollowUser } from '../api/apiClient';
import { Loader2, UserPlus, UserCheck } from 'lucide-react';

function FollowButton({ usernameToFollow, initialIsFollowing }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(usernameToFollow);
        setIsFollowing(false);
      } else {
        await followUser(usernameToFollow);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Follow/unfollow failed", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const baseClasses = "flex items-center justify-center gap-2 font-bold py-2 px-6 rounded-lg transition-colors w-32";
  const followClasses = "bg-sky-600 text-white hover:bg-sky-700";
  const followingClasses = "bg-slate-700 text-slate-300 hover:bg-rose-600/20 hover:text-rose-500 hover:border-rose-500 border border-slate-600";
  
  return (
    <button onClick={handleClick} disabled={isLoading} className={`${baseClasses} ${isFollowing ? followingClasses : followClasses}`}>
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : isFollowing ? (
        <> <UserCheck size={16} /> Following </>
      ) : (
        <> <UserPlus size={16} /> Follow </>
      )}
    </button>
  );
}
export default FollowButton;