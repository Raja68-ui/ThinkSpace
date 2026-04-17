import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Clock, ShieldCheck, Mail, Calendar, MessageSquare } from 'lucide-react';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}/profile`);
        setProfile(res.data.user);
        setUserPosts(res.data.posts);
      } catch (err) {
        console.error(err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleDeletePost = async (e, postId) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setUserPosts(userPosts.filter(p => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  if (loading) return <Loader />;
  if (error || !profile) return <div className="error-msg text-center">{error || "User not found"}</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(6, 9, 19, 0.9))' }}>
        <div style={{ 
          width: '100px', height: '100px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontSize: '3.5rem', fontWeight: 700, color: '#fff',
          boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)'
        }}>
          {profile.username.charAt(0).toUpperCase()}
        </div>
        
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>{profile.username}</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={16} /> Contact Private</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={16} /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MessageSquare size={16} /> {userPosts.length} Posts</span>
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            {profile.role === 'admin' ? (
              <span className="badge badge-admin"><ShieldCheck size={12} style={{ display: 'inline', marginRight: '0.2rem' }} /> Administrator</span>
            ) : (
              <span className="badge badge-user">Community Member</span>
            )}
            
            {!profile.isActive && <span className="badge badge-inactive">Banned User</span>}
          </div>
        </div>
      </div>

      <div className="page-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem' }}>Discussion History</h2>
      </div>

      {userPosts.length === 0 ? (
        <div className="card text-center text-secondary">
          <p>This user hasn't started any discussions yet.</p>
        </div>
      ) : (
        <div className="post-list">
          {userPosts.map((post) => (
            <Link to={`/post/${post._id}`} key={post._id} className="card post-card" style={{ display: 'block', textDecoration: 'none', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>{post.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="badge badge-user" style={{ fontSize: '0.7rem' }}>{post.category || 'General'}</span>
                  {(user && (user.id === profile._id || user.role === 'admin')) && (
                    <button onClick={(e) => handleDeletePost(e, post._id)} className="btn-icon" title="Delete Post" style={{ color: 'var(--danger)', padding: '0.2rem', margin: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  )}
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                {post.description.substring(0, 150)}...
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                 <span>{post.likes?.length || 0} Likes</span>
                 <span>{post.dislikes?.length || 0} Dislikes</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
