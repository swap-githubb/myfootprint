import { Link, Film } from 'lucide-react';

function ContentCard({ item, showAuthor = false }) { // Add showAuthor prop
  const domain = new URL(item.url).hostname.replace('www.', '');

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-sky-500 transition-colors duration-300">
      <div className="flex items-center justify-between gap-2 text-sm text-slate-400 mb-3">
        <div className="flex items-center gap-2">
            {item.content_type === 'video' ? <Film size={16} /> : <Link size={16} />}
            <span>{domain}</span>
        </div>
        {/* Conditionally render the author */}
        {showAuthor && (
            <span className="text-xs">Shared by <a href={`/profile/${item.owner_username}`} className="font-bold text-slate-300 hover:text-sky-500">{item.owner_username}</a></span>
        )}
      </div>
      <h2 className="text-xl font-bold text-white mb-2">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors">
          {item.title}
        </a>
      </h2>
      <p className="text-slate-300 leading-relaxed">{item.summary}</p>
    </div>
  );
}
export default ContentCard;