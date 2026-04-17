import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ImagePlus } from 'lucide-react';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate(`/post/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Start a Discussion</h1>
        <p className="text-secondary">Share your thoughts with the community.</p>
      </div>

      <div className="card">
        {error && <div className="error-msg">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="What's on your mind?"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              placeholder="Expand on your thoughts..."
              rows={8}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <option value="General">General</option>
              <option value="Tech">Tech</option>
              <option value="News">News</option>
              <option value="Question">Question</option>
              <option value="Debate">Debate</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Attach Image (Optional)</label>
            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
              <button type="button" className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'none' }}>
                <ImagePlus size={18} /> Choose File
              </button>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', opacity: 0, cursor: 'pointer' }}
              />
            </div>
            {previewUrl && (
              <div style={{ marginTop: '1rem' }}>
                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <button type="button" className="btn-icon text-danger" style={{ display: 'block', marginTop: '0.5rem' }} onClick={() => { setImage(null); setPreviewUrl(''); }}>
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
