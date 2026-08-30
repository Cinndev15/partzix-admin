import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import PartzixBlanco from '../assets/PARTZIX-BLANCO.png';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://api.partzix.com/api';

export default function Login({ onForgotPasswordClick, onLoginSuccess, initialMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState(initialMessage || { type: '', text: '' });

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '¡Inicio de sesión exitoso! Redirigiendo...' });
        // Simulating minor delay for premium transition feel
        setTimeout(() => {
          onLoginSuccess(data.token, email, data.user?.name);
        }, 1200);
      } else {
        setMessage({ type: 'error', text: data.message || 'Credenciales incorrectas. Inténtalo de nuevo.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al conectar con el servidor. Verifica tu conexión.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Column: Visual Showcase */}
      <div className="image-column">
        <img 
          src="/login_bg.png" 
          alt="Partzix Automotive Mechanical Parts" 
          className="image-bg" 
        />
        <div className="image-overlay"></div>
        
        <div className="branding-header">
          <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={PartzixBlanco} 
              alt="Partzix Logo" 
              style={{ height: '78px', width: 'auto', objectFit: 'contain' }} 
            />
          </div>
        </div>

        <div className="branding-footer">
          <h1 className="branding-title">El Futuro de la Gestión de Autopartes</h1>
          <p className="branding-subtitle">
            Administra almacenes, inventarios y conecta con miles de compradores en el marketplace de repuestos líder de Colombia.
          </p>
        </div>
      </div>

      {/* Right Column: Authentication form */}
      <div className="form-column">
        <div className="form-wrapper glass-card">
          <div className="form-header">
            <h2 className="form-title">Iniciar Sesión</h2>
            <p className="form-subtitle">Ingresa tus credenciales para acceder al panel de administración.</p>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="alert-icon" size={18} />
              ) : (
                <AlertCircle className="alert-icon" size={18} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Correo Electrónico</label>
              <div className="input-container">
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="admin@partzix.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <Mail className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Contraseña</label>
              <div className="input-container">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <Lock className="input-icon" size={18} />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex-between">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  className="checkbox-custom" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Recuérdame
              </label>
              <a 
                href="#" 
                className="link-accent"
                onClick={(e) => {
                  e.preventDefault();
                  onForgotPasswordClick();
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <div className="spinner"></div> : (
                <>
                  <LogIn size={18} /> Ingresar
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
