import { Link, Film } from 'lucide-react';
import { marked } from 'marked';

function ContentCard({ item, showAuthor = false }) {
  const domain = new URL(item.url).hostname.replace('www.', '');

  // Create a function to safely parse and sanitize the summary
  const getHTML = (markdownText) => {
    if (!markdownText) return { __html: '' };
    const rawHtml = marked.parse(markdownText);
    return { __html: rawHtml };
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-sky-500 transition-colors duration-300">
      <div className="flex items-center justify-between gap-2 text-sm text-slate-400 mb-3">
        <div className="flex items-center gap-2">
          {item.content_type === 'video' ? <Film size={16} /> : <Link size={16} />}
          <span>{domain}</span>
        </div>
        {showAuthor && (
          <span className="text-xs">Shared by <a href={`/profile/${item.owner_username}`} className="font-bold text-slate-300 hover:text-sky-500">{item.owner_username}</a></span>
        )}
      </div>
      <h2 className="text-xl font-bold text-white mb-4">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors">
          {item.title}
        </a>
      </h2>
      
      {/* We use a special div with Tailwind's 'prose' classes for beautiful typography */}
      <div
        className="prose prose-invert prose-p:my-2 prose-headings:my-3 max-w-none"
        dangerouslySetInnerHTML={getHTML(item.summary)}
      />
    </div>
  );
}

export default ContentCard;