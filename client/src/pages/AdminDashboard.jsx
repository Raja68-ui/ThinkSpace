import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import { Users, Trash2, Ban, ShieldCheck, MessageSquare, ExternalLink, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Pages.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts');
      // Sort posts by highest report count, then chronological
      const sortedPosts = res.data.sort((a, b) => {
        const reportsA = a.reports?.length || 0;
        const reportsB = b.reports?.length || 0;
        if (reportsB !== reportsA) return reportsB - reportsA;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setPosts(sortedPosts);
    } catch (err) {
      console.error(err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId) => {
    if (!window.confirm('Are you sure you want to change this user\'s status?')) return;
    
    try {
      await api.put(`/admin/users/${userId}/ban`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: This will permanently delete the user. Are you sure?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('WARNING: This will irreversibly delete the post out of the forum. Are you sure?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed to delete post');
    }
  };

  return (
    <div className="animate-fade-in dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
      <div className="admin-sidebar card" style={{ position: 'sticky', top: '100px' }}>
        <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          Moderation
        </h3>
        <div 
          className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', background: activeTab === 'users' ? 'rgba(139, 92, 246, 0.2)' : 'transparent', color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          <Users size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} /> User Management
        </div>
        <div 
          className={`admin-nav-item ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
          style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: 'var(--radius-sm)', background: activeTab === 'posts' ? 'rgba(239, 68, 68, 0.2)' : 'transparent', color: activeTab === 'posts' ? 'var(--danger)' : 'var(--text-secondary)' }}
        >
          <MessageSquare size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} /> Content Moderation
        </div>
      </div>

      <div className="admin-content">
        <div className="page-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h1>Admin Dashboard</h1>
          <p className="text-secondary">
            {activeTab === 'users' 
              ? 'Manage site users, deactivate accounts, and remove bad actors.' 
              : 'Global overview of all posts. Highly reported content surfaces to the top instantly.'}
          </p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? <Loader /> : (
          <div className="card table-wrapper" style={{ overflowX: 'auto', padding: '0' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {activeTab === 'users' ? (
                    <>
                      <th style={{ padding: '1.2rem 1rem' }}>Username</th>
                      <th style={{ padding: '1.2rem 1rem' }}>Email</th>
                      <th style={{ padding: '1.2rem 1rem' }}>Role</th>
                      <th style={{ padding: '1.2rem 1rem' }}>Status</th>
                      <th style={{ padding: '1.2rem 1rem' }}>Joined</th>
                      <th style={{ padding: '1.2rem 1rem' }}>Actions</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: '1.2rem 1rem' }}>Author</th>
                      <th style={{ padding: '1.2rem 1rem' }}>Title Snippet</th>
                      <th style={{ padding: '1.2rem 1rem' }}>Reports</th>
                      <th style={{ padding: '1.2rem 1rem' }}>Media Attached</th>
                      <th style={{ padding: '1.2rem 1rem' }}>Posted</th>
                      <th style={{ padding: '1.2rem 1rem' }}>Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeTab === 'users' ? (
                  users.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>
                         <Link to={`/user/${user._id}`} style={{ textDecoration: 'none', color: '#a5b4fc' }}>{user.username}</Link>
                      </td>
                      <td style={{ padding: '1rem' }} className="text-secondary">{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        {user.role === 'admin' ? (
                          <span className="badge badge-admin"><ShieldCheck size={12} style={{ display: 'inline', marginRight: '0.2rem' }} /> Admin</span>
                        ) : (
                          <span className="badge badge-user">User</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {user.isActive ? (
                          <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Active</span>
                        ) : (
                          <span className="badge badge-inactive">Banned</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }} className="text-secondary">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {user.role !== 'admin' && (
                            <>
                              <button 
                                className="btn-icon" 
                                title={user.isActive ? "Ban User" : "Unban User"}
                                onClick={() => handleToggleBan(user._id)}
                              >
                                <Ban size={18} stroke={user.isActive ? "var(--text-secondary)" : "var(--accent-primary)"} />
                              </button>
                              <button 
                                className="btn-icon" 
                                title="Delete User"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  posts.map(post => {
                    const reportCount = post.reports?.length || 0;
                    const isFlagged = reportCount > 0;
                    return (
                      <tr key={post._id} style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)', 
                        backgroundColor: isFlagged ? 'rgba(239, 68, 68, 0.08)' : 'transparent' 
                      }}>
                        <td style={{ padding: '1rem', fontWeight: 500 }}>
                          <Link to={`/user/${post.author?._id}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>{post.author?.username || 'Unknown'}</Link>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <Link to={`/post/${post._id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isFlagged ? '#fca5a5' : '#c4b5fd', textDecoration: 'none' }}>
                            {post.title.substring(0, 40)}{post.title.length > 40 ? '...' : ''} <ExternalLink size={14} />
                          </Link>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {isFlagged ? (
                             <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', color: '#fca5a5', display: 'flex', gap: '0.3rem', alignItems: 'center', width: 'fit-content' }}>
                                <Flag size={12}/> {reportCount} Flag{reportCount > 1 ? 's' : ''}
                             </span>
                          ) : (
                             <span className="text-secondary">0</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {post.imageUrl ? 'Yes' : 'No'}
                        </td>
                        <td style={{ padding: '1rem' }} className="text-secondary">{new Date(post.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                             <button 
                               className="btn-icon" 
                               style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}
                               title="Take Down Post"
                               onClick={() => handleDeletePost(post._id)}
                             >
                               Take Down
                             </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                {activeTab === 'users' && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-secondary" style={{ padding: '2rem' }}>
                      No users found.
                    </td>
                  </tr>
                )}
                {activeTab === 'posts' && posts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-secondary" style={{ padding: '2rem' }}>
                      No posts found on the platform.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
