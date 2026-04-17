import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Trash2, User, Clock, MessageCircle, ThumbsUp, ThumbsDown, Share2, Check, Flag } from 'lucide-react';
import './Pages.css';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data.post);
        setComments(res.data.comments);
      } catch (err) {
        console.error(err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const spawnIcon = (type, x, y) => {
    const iconId = Date.now() + Math.random();
    setFloatingIcons(prev => [...prev, { id: iconId, type, x, y }]);
    setTimeout(() => {
      setFloatingIcons(prev => prev.filter(icon => icon.id !== iconId));
    }, 1000);
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/comments/${id}`, { text: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleLike = async (e) => {
    if (!user) return alert('Please log in to like posts');
    spawnIcon('like', e.clientX, e.clientY);
    try {
      const res = await api.put(`/posts/${id}/like`);
      setPost({...post, likes: res.data.likes, dislikes: res.data.dislikes});
    } catch(err) {
      console.error(err);
    }
  };

  const handleDislike = async (e) => {
    if (!user) return alert('Please log in to dislike posts');
    spawnIcon('dislike', e.clientX, e.clientY);
    try {
      const res = await api.put(`/posts/${id}/dislike`);
      setPost({...post, likes: res.data.likes, dislikes: res.data.dislikes});
    } catch(err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    const url = `http://${window.location.host}/post/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReportAction = () => {
    if (!user) return alert('Please log in to report posts');
    setShowReportModal(true);
  };

  const submitReport = async () => {
    try {
      const res = await api.put(`/posts/${id}/report`, { reason: reportReason });
      setPost({...post, reports: res.data});
      setShowReportModal(false);
      alert('Post logged with moderation. Thank you for reporting.');
    } catch(err) {
      alert(err.response?.data?.message || 'Action failed');
      setShowReportModal(false);
    }
  };

  if (loading) return <Loader />;
  if (error && !post) return <div className="error-msg text-center">{error}</div>;
  if (!post) return <div className="card text-center text-secondary">Post not found</div>;

  const canDeletePost = user && (user.id === post.author?._id || user.role === 'admin');
  const userHasLiked = user && post.likes?.includes(user.id);
  const userHasDisliked = user && post.dislikes?.includes(user.id);
  const userHasReported = user && post.reports?.some(r => r.user === user.id || r === user.id);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Report Post</h3>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>Please select a reason for reporting:</p>
            <select 
              value={reportReason} 
              onChange={e => setReportReason(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-md)' }}
            >
              <option value="Spam">Spam</option>
              <option value="Violence">Violence</option>
              <option value="Hatred">Hatred</option>
              <option value="Other">Other</option>
            </select>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn" style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)' }} onClick={() => setShowReportModal(false)}>Cancel</button>
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', border: 'none' }} onClick={submitReport}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
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

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="post-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 className="post-title" style={{ fontSize: '2.4rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>{post.title}</h1>
            {canDeletePost && (
              <button onClick={handleDeletePost} className="btn-icon" title="Delete Post" style={{ color: 'var(--danger)' }}>
                <Trash2 size={20} />
              </button>
            )}
          </div>
          
          <div className="post-meta" style={{ marginTop: '0.5rem', paddingTop: 0, border: 'none' }}>
            <span className="timestamp" style={{ zIndex: 10 }}>
              <User size={16} style={{color: 'var(--accent-primary)'}} /> 
              <Link to={`/user/${post.author?._id}`} style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>
                {post.author?.username || 'Unknown'}
              </Link>
            </span>
            <span className="timestamp">
              <Clock size={16} /> {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        
        {post.imageUrl && (
          <div style={{ margin: '-1rem -1.75rem 2rem -1.75rem', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
             <img src={`https://thinkspace-vmy5.onrender.com${post.imageUrl}`} alt="Post Media" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block', backgroundColor: 'rgba(0,0,0,0.4)' }} />
          </div>
        )}

        <div className="post-content">
          {post.description}
        </div>
        
        <div className="post-actions" style={{ overflow: 'hidden' }}>
          <button className={`action-btn ${userHasLiked ? 'active-like' : ''}`} onClick={handleLike}>
            <ThumbsUp size={18} /> {post.likes?.length || 0}
          </button>
          
          <button className={`action-btn ${userHasDisliked ? 'active-dislike' : ''}`} onClick={handleDislike}>
            <ThumbsDown size={18} /> {post.dislikes?.length || 0}
          </button>

          <button 
            className="action-btn" 
            onClick={handleReportAction}
            style={userHasReported ? { color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)' } : {}}
            disabled={userHasReported}
          >
            <Flag size={18} /> {userHasReported ? 'Reported' : 'Report'}
          </button>
          
          <div style={{ flex: 1 }}></div>
          
          <button className="action-btn" onClick={handleShare}>
            {copied ? <Check size={18} className="text-success" /> : <Share2 size={18} />}
            {copied ? 'Copied URL!' : 'Share'}
          </button>
        </div>
      </div>

      <div className="comments-section">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#a5b4fc' }}>
          <MessageCircle size={22} /> Comments ({comments.length})
        </h3>
        
        {error && <div className="error-msg">{error}</div>}

        {user ? (
          <form onSubmit={handleAddComment} style={{ marginBottom: '2.5rem' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                required
                style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="card text-center" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
            <p className="text-secondary">Please <Link to="/login" style={{color: 'var(--accent-primary)'}}>log in</Link> to leave a comment.</p>
          </div>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="text-secondary text-center" style={{ padding: '2rem 0' }}>No comments yet. Start the conversation!</p>
          ) : (
            comments.map(comment => {
              const canDeleteComment = user && (user.id === comment.user?._id || user.role === 'admin');
              
              return (
                <div key={comment._id} className="comment-card">
                  <div className="comment-header">
                    <div className="timestamp">
                      <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                        {comment.user?.username || 'Unknown'}
                      </span>
                      <span>•</span>
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    {canDeleteComment && (
                      <button onClick={() => handleDeleteComment(comment._id)} className="btn-icon" style={{color: 'var(--text-secondary)'}}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginTop: '0.5rem', lineHeight: '1.6' }}>
                    {comment.text}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
