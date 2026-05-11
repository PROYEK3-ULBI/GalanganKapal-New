import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
// Import logo dengan nama file NaviStock.png
import logoNaviStock from '../../assets/NaviStock.png';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { setRole } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        const roleMap = { 
          'admin@shipyard.co.id': 'admin', 
          'supervisor@shipyard.co.id': 'supervisor', 
          'staff@shipyard.co.id': 'staff' 
        };
        setRole(roleMap[email] || 'staff');
        navigate('/');
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 800);
  };

  const quickLogin = (email) => {
    setEmail(email);
    setPassword('admin123');
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-pattern" />
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            {/* Bagian Logo: Sekarang memanggil logoNaviStock */}
            <div className="login-logo">
              <img src={logoNaviStock} alt="NaviStock Logo" />
            </div>
            <h1>SIMS</h1>
            <p>Sistem Manajemen Inventaris Galangan Kapal</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}
            <div className="form-group">
              <label>Alamat Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Masukkan email Anda" required />
            </div>
            <div className="form-group">
              <label>Kata Sandi</label>
              <div className="password-input">
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan kata sandi" required />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="login-spinner" /> : <LogIn size={18} />}
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <div className="login-demo">
            <p>Akses Demo Cepat:</p>
            <div className="demo-buttons">
              <button onClick={() => quickLogin('admin@shipyard.co.id')}>Admin</button>
              <button onClick={() => quickLogin('supervisor@shipyard.co.id')}>Supervisor</button>
              <button onClick={() => quickLogin('staff@shipyard.co.id')}>Staff</button>
            </div>
            <p className="demo-hint">Kata Sandi: <code>admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}