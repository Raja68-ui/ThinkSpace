import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, Circle } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Password criteria state
  const [criteria, setCriteria] = useState({
    length: false,
    capital: false,
    number: false,
    special: false
  });

  useEffect(() => {
    setCriteria({
      length: password.length >= 8,
      capital: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+={}\[\]:;"'<>,.?\\/-]/.test(password)
    });
  }, [password]);

  const allCriteriaMet = Object.values(criteria).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allCriteriaMet) {
      setError('Please ensure your password meets all criteria.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    const result = await register(username, email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="card auth-card">
        <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Join ThinkSpace</h2>
        {error && <div className="error-msg">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder="Choose a cool username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Create a strong password"
            />
          </div>

          <div className="password-criteria">
            <div className={`criteria-item ${criteria.length ? 'met' : ''}`}>
              {criteria.length ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              At least 8 characters
            </div>
            <div className={`criteria-item ${criteria.capital ? 'met' : ''}`}>
              {criteria.capital ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              One capital letter
            </div>
            <div className={`criteria-item ${criteria.number ? 'met' : ''}`}>
              {criteria.number ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              One number
            </div>
            <div className={`criteria-item ${criteria.special ? 'met' : ''}`}>
              {criteria.special ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              One special character
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || !allCriteriaMet}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        
        <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
