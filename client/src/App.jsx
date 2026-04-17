import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import { AuthContext } from './context/AuthContext';
import Loader from './components/Loader';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return <Loader />;
  if (!user) return <Login />;
  if (requireAdmin && user.role !== 'admin') return <Home />;
  
  return children;
};

const WelcomeGraphic = ({ username }) => {
  return (
    <div className="welcome-overlay">
      <div className="welcome-content">
        <div className="welcome-icon">👋</div>
        <h2>Welcome, <span>{username}</span>!</h2>
        <p>Entering the ThinkSpace...</p>
      </div>
    </div>
  );
};

function App() {
  const { loading, user } = React.useContext(AuthContext);
  const [showWelcome, setShowWelcome] = React.useState(false);
  const prevUserRef = React.useRef(null);

  React.useEffect(() => {
    if (user && !prevUserRef.current) {
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 3000);
    }
    prevUserRef.current = user;
  }, [user]);

  if (loading) return <div className="page-wrapper"><Loader /></div>;

  return (
    <>
      {showWelcome && user && <WelcomeGraphic username={user.username} />}
      <Navbar />
      <div className="page-wrapper container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostDetails />} />
          <Route path="/user/:id" element={<UserProfile />} />
          
          {/* Protected Routes */}
          <Route path="/create" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  );
}

export default App;
