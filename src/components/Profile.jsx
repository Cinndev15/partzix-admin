import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, KeyRound, Shield, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Profile({ authToken, apiBaseUrl, userEmail, onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states - Personal Info
  const [name, setName] = useState('');

  // Form states - Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`${apiBaseUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setProfile(resData.data);
        setName(resData.data.name || '');
      } else {
        setErrorMsg(resData.message || 'Error al cargar los datos del perfil.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSavingInfo(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ name })
      });
      const resData = await response.json();
      if (resData.success) {
        setSuccessMsg('Información personal actualizada con éxito.');
        setProfile(prev => ({ ...prev, name: resData.data.name }));
        if (onProfileUpdate) {
          onProfileUpdate(resData.data.name);
        }
      } else {
        setErrorMsg(resData.message || 'Error al actualizar el perfil.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error de red. No se pudo conectar con el servidor.');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      const resData = await response.json();
      if (resData.success) {
        setSuccessMsg('Contraseña actualizada con éxito.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(resData.message || 'Error al cambiar la contraseña.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error de red. No se pudo conectar con el servidor.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6rem' }}>
        <Loader2 className="spinner" size={36} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.8rem', marginBottom: '0.25rem' }}>Mi Perfil</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Administra tu información de cuenta y configuraciones de seguridad.</p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{errorMsg}</span>
        </div>
      )}

      {/* Forms Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Personal Info Form */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <User size={20} style={{ color: 'var(--accent)' }} />
            <h4 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.25rem', fontWeight: 600 }}>Información Personal</h4>
          </div>

          <form onSubmit={handleUpdateInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <Mail size={14} className="text-muted" /> Correo Electrónico
              </label>
              <input
                type="email"
                className="form-input"
                value={userEmail}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(255,255,255,0.02)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <User size={14} className="text-muted" /> Nombre Completo
              </label>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                placeholder="Tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <Shield size={14} className="text-muted" /> Rol de Usuario
              </label>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 85, 0, 0.1)', border: '1px solid rgba(255, 85, 0, 0.2)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
                {profile?.role === 'admin' ? 'Administrador' : 'Almacén'}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={savingInfo}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer' }}
            >
              {savingInfo ? (
                <>
                  <Loader2 size={16} className="spinner" /> Guardando...
                </>
              ) : (
                <>
                  <Save size={16} /> Guardar Cambios
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <KeyRound size={20} style={{ color: 'var(--accent)' }} />
            <h4 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.25rem', fontWeight: 600 }}>Seguridad de la Cuenta</h4>
          </div>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="current-pass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <Lock size={14} className="text-muted" /> Contraseña Actual
              </label>
              <input
                id="current-pass"
                type="password"
                className="form-input"
                placeholder="Ingresa tu contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-pass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <Lock size={14} className="text-muted" /> Nueva Contraseña
              </label>
              <input
                id="new-pass"
                type="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                <Lock size={14} className="text-muted" /> Confirmar Nueva Contraseña
              </label>
              <input
                id="confirm-pass"
                type="password"
                className="form-input"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={savingPassword}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer' }}
            >
              {savingPassword ? (
                <>
                  <Loader2 size={16} className="spinner" /> Actualizando...
                </>
              ) : (
                <>
                  <KeyRound size={16} /> Actualizar Contraseña
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
