import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Clock, User, MessageCircle, ThumbsUp, ThumbsDown, Share2, Check, Search } from 'lucide-react';
import './Pages.css'; 

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [copiedId, setCopiedId] = useState(null);
  const [floatingIcons, setFloatingIcons] = useState([]);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'General', 'Tech', 'News', 'Question', 'Debate'];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const spawnIcon = (type, x, y) => {
    const id = Date.now() + Math.random();
    setFloatingIcons(prev => [...prev, { id, type, x, y }]);
    setTimeout(() => {
      setFloatingIcons(prev => prev.filter(icon => icon.id !== id));
    }, 1000);
  };

  const handleLike = async (e, postId) => {
    e.preventDefault(); 
    if (!user) return alert('Please log in to like posts');
    spawnIcon('like', e.clientX, e.clientY);
    try {
      const res = await api.put(`/posts/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes, dislikes: res.data.dislikes } : p));
    } catch(err) {
      console.error(err);
    }
  };

  const handleDislike = async (e, postId) => {
    e.preventDefault(); 
    if (!user) return alert('Please log in to dislike posts');
    spawnIcon('dislike', e.clientX, e.clientY);
    try {
      const res = await api.put(`/posts/${postId}/dislike`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes, dislikes: res.data.dislikes } : p));
    } catch(err) {
      console.error(err);
    }
  };

  const handleShare = (e, postId) => {
    e.preventDefault();
    const url = `http://${window.location.host}/post/${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeletePost = async (e, postId) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      post.title.toLowerCase().includes(searchLower) || 
      post.description.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  if (loading) return <Loader />;

  return (
    <div className="animate-fade-in">
      {/* Floating Particles Overlay */}
      {floatingIcons.map(icon => (
        <div 
          key={icon.id} 
          className={`floating-particle floating-${icon.type}`} 
          style={{ left: icon.x, top: icon.y }}
        >
          {icon.type === 'like' ? <ThumbsUp size={36} fill="currentColor" /> : <ThumbsDown size={36} fill="currentColor" />}
        </div>
      ))}

      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>Recent Discussions</h1>
        <p className="text-secondary" style={{ fontSize: '1.2rem' }}>Explore the latest thoughts, media, and join the conversation.</p>
      </div>

      <div style={{ maxWidth: '850px', margin: '0 auto 2.5rem auto' }}>
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search discussions by title or content..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '3rem', fontSize: '1.05rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`badge ${activeCategory === cat ? 'badge-admin' : ''}`}
              style={{ 
                cursor: 'pointer', 
                padding: '0.4rem 1rem', 
                border: activeCategory === cat ? undefined : '1px solid rgba(255,255,255,0.1)',
                background: activeCategory === cat ? undefined : 'rgba(0,0,0,0.3)',
                color: activeCategory === cat ? undefined : 'var(--text-secondary)',
                fontSize: '0.85rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="card text-center text-secondary" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <p>No posts match your filters. Try adjusting your search!</p>
        </div>
      ) : (
        <div className="post-list" style={{ maxWidth: '850px', margin: '0 auto' }}>
          {filteredPosts.map((post) => {
            const userHasLiked = user && post.likes?.includes(user.id);
            const userHasDisliked = user && post.dislikes?.includes(user.id);

            return (
              <Link to={`/post/${post._id}`} key={post._id} className="card post-card" style={{ display: 'block', textDecoration: 'none', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h2 className="post-title" style={{ fontSize: '1.6rem', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>{post.title}</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-user" style={{ fontSize: '0.7rem' }}>{post.category || 'General'}</span>
                    {(user && (user.id === post.author?._id || user.role === 'admin')) && (
                      <button onClick={(e) => handleDeletePost(e, post._id)} className="btn-icon" title="Delete Post" style={{ color: 'var(--danger)', padding: '0.2rem', margin: 0 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="post-preview" style={{ color: '#cbd5e1', fontSize: '1.05rem', margin: '1rem 0' }}>{post.description.substring(0, 180)}...</p>
                
                {post.imageUrl && (
                  <div style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={`https://thinkspace-vmy5.onrender.com${post.imageUrl}`} alt="Post Media" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}

                <div className="post-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <span className="timestamp" style={{ zIndex: 10 }}>
                      <User size={16} color="#8b5cf6" /> 
                      <Link to={`/user/${post.author?._id}`} style={{ fontWeight: 500, color: '#f8fafc', textDecoration: 'none', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
                        {post.author?.username || 'Unknown'}
                      </Link>
                    </span>
                    <span className="timestamp">
                      <Clock size={16} /> {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="post-actions" style={{ margin: 0, padding: 0, border: 'none', gap: '0.5rem' }}>
                    <button className={`action-btn ${userHasLiked ? 'active-like' : ''}`} onClick={(e) => handleLike(e, post._id)}>
                      <ThumbsUp size={16} /> {post.likes?.length || 0}
                    </button>
                    
                    <button className={`action-btn ${userHasDisliked ? 'active-dislike' : ''}`} onClick={(e) => handleDislike(e, post._id)}>
                      <ThumbsDown size={16} /> {post.dislikes?.length || 0}
                    </button>

                    <button className="action-btn" onClick={(e) => handleShare(e, post._id)}>
                      {copiedId === post._id ? <Check size={16} className="text-success" /> : <Share2 size={16} />}
                      {copiedId === post._id ? 'Copied!' : 'Share'}
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
