import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

function UserList({ users, emptyMessage }) {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 bg-slate-800 rounded-lg">
        <p>{emptyMessage || "No users to display."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map(username => (
        <Link 
          key={username} 
          to={`/profile/${username}`} 
          className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-sky-500 transition-colors"
        >
          <div className="bg-slate-700 p-2 rounded-full">
            <User className="text-slate-400" />
          </div>
          <span className="font-bold text-white">{username}</span>
        </Link>
      ))}
    </div>
  );
}

export default UserList;