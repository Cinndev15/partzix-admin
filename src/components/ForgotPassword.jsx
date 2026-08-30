import React, { useState, useRef } from 'react';
import { Mail, Lock, Key, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://api.partzix.com/api';

export default function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState(1); // 1: request OTP, 2: verify and reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const otpRefs = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Código de recuperación enviado. Revisa tu correo.' });
        setStep(2);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al enviar código.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de red. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setMessage({ type: 'error', text: 'Ingresa el código OTP completo de 6 dígitos.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otpCode,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contraseña restablecida con éxito. Redirigiendo...' });
        setTimeout(() => {
          onBackToLogin();
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al restablecer contraseña.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de red. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="form-header">
        <h2 className="form-title">
          {step === 1 ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
        </h2>
        <p className="form-subtitle">
          {step === 1 
            ? 'Ingresa tu correo para recibir un código OTP de restablecimiento' 
            : 'Ingresa el código OTP enviado y tu nueva contraseña'}
        </p>
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

      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-recovery">Correo Electrónico</label>
            <div className="input-container">
              <input
                id="email-recovery"
                type="email"
                className="form-input"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="input-icon" size={18} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Enviar Código'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label className="form-label">Código OTP (6 dígitos)</label>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={loading}
                  required
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-password">Nueva Contraseña</label>
            <div className="input-container">
              <input
                id="new-password"
                type="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Lock className="input-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirmar Contraseña</label>
            <div className="input-container">
              <input
                id="confirm-password"
                type="password"
                className="form-input"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Lock className="input-icon" size={18} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Restablecer Contraseña'}
          </button>
        </form>
      )}

      <div className="footer-link-container">
        <a 
          href="#" 
          className="link-accent" 
          onClick={(e) => {
            e.preventDefault();
            onBackToLogin();
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <ArrowLeft size={16} /> Volver al Login
        </a>
      </div>
    </div>
  );
}
