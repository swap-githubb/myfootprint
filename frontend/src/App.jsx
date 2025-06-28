import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import FeedPage from './pages/FeedPage';
import SearchPage from './pages/SearchPage';
import FollowingPage from './pages/FollowingPage';
import FollowersPage from './pages/FollowersPage';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />}/>
           <Route path="/profile/:username/following" element={<FollowingPage />} />
          <Route path="/profile/:username/followers" element={<FollowersPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;