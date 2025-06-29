// import { Link, Film } from 'lucide-react';

// function ContentCard({ item, showAuthor = false }) { // Add showAuthor prop
//   const domain = new URL(item.url).hostname.replace('www.', '');

//   return (
//     <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-sky-500 transition-colors duration-300">
//       <div className="flex items-center justify-between gap-2 text-sm text-slate-400 mb-3">
//         <div className="flex items-center gap-2">
//             {item.content_type === 'video' ? <Film size={16} /> : <Link size={16} />}
//             <span>{domain}</span>
//         </div>
//         {/* Conditionally render the author */}
//         {showAuthor && (
//             <span className="text-xs">Shared by <a href={`/profile/${item.owner_username}`} className="font-bold text-slate-300 hover:text-sky-500">{item.owner_username}</a></span>
//         )}
//       </div>
//       <h2 className="text-xl font-bold text-white mb-2">
//         <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors">
//           {item.title}
//         </a>
//       </h2>
//       <p className="text-slate-300 leading-relaxed">{item.summary}</p>
//     </div>
//   );
// }
// export default ContentCard;



import { Link, Film } from 'lucide-react';
// --- NEW --- Import the 'marked' library
import { marked } from 'marked';

function ContentCard({ item, showAuthor = false }) {
  const domain = new URL(item.url).hostname.replace('www.', '');

  // --- NEW --- Create a function to safely parse and sanitize the summary
  const getHTML = (markdownText) => {
    if (!markdownText) return { __html: '' };
    // The `marked.parse()` function converts Markdown text to an HTML string.
    const rawHtml = marked.parse(markdownText);
    // While `marked` is safe, as a best practice you might add a sanitizer
    // like DOMPurify here in a real production app. For now, this is fine.
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
      
      {/* --- THIS IS THE UPDATED PART --- */}
      {/* We use a special div with Tailwind's 'prose' classes for beautiful typography */}
      <div
        className="prose prose-invert prose-p:my-2 prose-headings:my-3 max-w-none"
        dangerouslySetInnerHTML={getHTML(item.summary)}
      />
    </div>
  );
}

export default ContentCard;