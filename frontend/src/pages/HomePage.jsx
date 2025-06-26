import { Link } from 'react-router-dom';
import { BookOpen, Clapperboard, Share2 } from 'lucide-react';

function HomePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
        Share Your<span className="text-sky-500"> Intellectual</span> Footprint.
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
        Automatically curate and share your favorite articles and videos with the world. Effortlessly build a public library of your mind.
      </p>
      <div className="mt-8">
        <Link
          to="/register"
          className="bg-sky-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-sky-700 transition-transform transform hover:scale-105"
        >
          Get Started for Free
        </Link>
      </div>
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
          <BookOpen className="mx-auto text-sky-500 h-12 w-12" />
          <h3 className="mt-4 text-xl font-bold text-white">Curate Articles</h3>
          <p className="mt-2 text-slate-400">Save insightful articles with a single click in your browser.</p>
        </div>
        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
          <Clapperboard className="mx-auto text-sky-500 h-12 w-12" />
          <h3 className="mt-4 text-xl font-bold text-white">Log Videos</h3>
          <p className="mt-2 text-slate-400">Keep a watch list of compelling videos and documentaries.</p>
        </div>
        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
          <Share2 className="mx-auto text-sky-500 h-12 w-12" />
          <h3 className="mt-4 text-xl font-bold text-white">Follow Others</h3>
          <p className="mt-2 text-slate-400">Discover what the smartest people are reading and watching.</p>
        </div>
      </div>
    </div>
  );
}
export default HomePage;