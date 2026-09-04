import React, { useState } from 'react';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import { LogOut, LayoutDashboard, Warehouse, TrendingUp, Package, ChevronDown, ChevronRight, Tag, GitFork, Layers, Car, Award, CalendarDays, Percent, GitBranch } from 'lucide-react';

import PartzixLogo from './assets/PARTZIX-AZUL.png';

export default function App() {
  const [currentView, setRawCurrentView] = useState('login'); // 'login', 'forgot-password', 'dashboard'
  const [activeTab, setRawActiveTab] = useState('resumen'); // 'resumen', 'almacenes', 'ventas', 'categorias', 'lineas', 'sublineas', 'modelos', 'marcas', 'versiones', 'anos', 'productos', 'impuestos'
  const [authToken, setAuthToken] = useState(localStorage.getItem('adminToken') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('adminEmail') || '');
  const [userName, setUserName] = useState(localStorage.getItem('adminName') || '');
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);

  const setActiveTab = (tab) => {
    window.location.hash = `#/dashboard/${tab}`;
    setRawActiveTab(tab);
  };

  const setCurrentView = (view) => {
    if (view === 'login') {
      window.location.hash = '#/login';
    } else if (view === 'forgot-password') {
      window.location.hash = '#/forgot-password';
    } else if (view === 'dashboard') {
      window.location.hash = `#/dashboard/${activeTab || 'resumen'}`;
    }
    setRawCurrentView(view);
  };

  const handleLoginSuccess = (token, email, name) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminEmail', email);
    localStorage.setItem('adminName', name || '');
    setAuthToken(token);
    setUserEmail(email);
    setUserName(name || '');
    setLoginMessage(null); // Clear any expiration message
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    setAuthToken('');
    setUserEmail('');
    setUserName('');
    setCurrentView('login');
  };

  // Helper to parse URL Hash
  const parseHash = () => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#/forgot-password')) {
      return { view: 'forgot-password', tab: '' };
    }
    if (hash.startsWith('#/dashboard')) {
      const parts = hash.split('/');
      const tab = parts[2] || 'resumen';
      return { view: 'dashboard', tab };
    }
    return { view: 'login', tab: '' };
  };

  // Synchronize state with URL Hash and implement Route Protection
  React.useEffect(() => {
    const handleHashChange = () => {
      const { view, tab } = parseHash();
      
      if (!authToken) {
        if (view !== 'login' && view !== 'forgot-password') {
          if (window.location.hash !== '#/login') {
            window.location.hash = '#/login';
          }
          setRawCurrentView('login');
        } else {
          setRawCurrentView(view);
        }
      } else {
        if (view !== 'dashboard') {
          const targetHash = `#/dashboard/${activeTab || 'resumen'}`;
          if (window.location.hash !== targetHash) {
            window.location.hash = targetHash;
          }
          setRawCurrentView('dashboard');
        } else {
          setRawCurrentView('dashboard');
          if (tab && tab !== activeTab) {
            setRawActiveTab(tab);
          }
        }
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [authToken, activeTab]);

  // Inactivity logout timer (5 minutes, or 10 seconds if devTimeout is active)
  React.useEffect(() => {
    if (!authToken) return;

    let timeoutId;
    
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      const isTestTimeout = window.location.hash.includes('test_timeout') || window.location.search.includes('test_timeout');
      const timeoutDuration = isTestTimeout ? 10000 : 5 * 60 * 1000; // 10s or 5min

      timeoutId = setTimeout(() => {
        handleLogout();
        setLoginMessage({
          type: 'info',
          text: 'Tu sesión ha expirado por inactividad de 5 minutos.'
        });
      }, timeoutDuration);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [authToken]);

  // Keep products submenu open if a product view is active
  React.useEffect(() => {
    if (['categorias', 'lineas', 'sublineas', 'modelos', 'marcas', 'versiones', 'anos', 'productos', 'impuestos'].includes(activeTab)) {
      setProductsExpanded(true);
    }
  }, [activeTab]);

  if (currentView === 'dashboard') {
    return (
      <div className="dashboard-container">
        {/* Left Sidebar Menu */}
        <aside className="dash-sidebar">
          <div className="dash-sidebar-top">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.75rem 0', marginBottom: '1rem' }}>
              <img 
                src={PartzixLogo} 
                alt="Partzix Admin" 
                style={{ height: '56px', width: 'auto', objectFit: 'contain' }} 
              />
            </div>

            <nav className="dash-sidebar-nav">
              <button 
                onClick={() => setActiveTab('resumen')} 
                className={`tab-button ${activeTab === 'resumen' ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('almacenes')} 
                className={`tab-button ${activeTab === 'almacenes' ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Warehouse size={18} /> Almacenes
              </button>
              
              {/* Productos Collapsible Menu */}
              <div>
                <button 
                  onClick={() => setProductsExpanded(!productsExpanded)} 
                  className={`tab-button ${['categorias', 'lineas', 'sublineas', 'modelos', 'marcas', 'versiones', 'anos', 'productos', 'impuestos'].includes(activeTab) ? 'active' : ''}`}
                  style={{ width: '100%', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={18} /> Productos
                  </span>
                  {productsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {productsExpanded && (
                  <div style={{ paddingLeft: '1rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '1px solid var(--border)', marginLeft: '1rem' }}>
                    <button 
                      onClick={() => setActiveTab('productos')} 
                      className={`tab-button ${activeTab === 'productos' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <Package size={14} /> Catálogo
                    </button>
                    <button 
                      onClick={() => setActiveTab('categorias')} 
                      className={`tab-button ${activeTab === 'categorias' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <Tag size={14} /> Categorías
                    </button>
                    <button 
                      onClick={() => setActiveTab('lineas')} 
                      className={`tab-button ${activeTab === 'lineas' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <GitFork size={14} /> Líneas
                    </button>
                    <button 
                      onClick={() => setActiveTab('sublineas')} 
                      className={`tab-button ${activeTab === 'sublineas' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <Layers size={14} /> Sublíneas
                    </button>
                    <button 
                      onClick={() => setActiveTab('marcas')} 
                      className={`tab-button ${activeTab === 'marcas' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <Award size={14} /> Marcas
                    </button>
                    <button 
                      onClick={() => setActiveTab('modelos')} 
                      className={`tab-button ${activeTab === 'modelos' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <Car size={14} /> Modelos
                    </button>
                    <button 
                      onClick={() => setActiveTab('versiones')} 
                      className={`tab-button ${activeTab === 'versiones' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <GitBranch size={14} /> Versiones
                    </button>
                    <button 
                      onClick={() => setActiveTab('anos')} 
                      className={`tab-button ${activeTab === 'anos' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <CalendarDays size={14} /> Años
                    </button>
                    <button 
                      onClick={() => setActiveTab('impuestos')} 
                      className={`tab-button ${activeTab === 'impuestos' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <Percent size={14} /> Impuestos
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setActiveTab('ventas')} 
                className={`tab-button ${activeTab === 'ventas' ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <TrendingUp size={18} /> Ventas & Métricas
              </button>
            </nav>
          </div>

          <div className="dash-sidebar-bottom">
            <div 
              onClick={() => setActiveTab('perfil')}
              className={`dash-sidebar-user ${activeTab === 'perfil' ? 'active-profile' : ''}`}
            >
              <div className="dash-avatar">
                {userName ? userName[0].toUpperCase() : (userEmail ? userEmail[0].toUpperCase() : 'A')}
              </div>
              <div className="dash-user-details">
                <span className="dash-username" title={userName || userEmail}>{userName || userEmail}</span>
                <span className="dash-userrole">Administrador</span>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn-secondary" 
              style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', width: '100%' }}
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Dynamic content rendering depending on chosen tab */}
        <Dashboard 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          authToken={authToken} 
          userEmail={userEmail} 
          userName={userName}
          onProfileUpdate={(newName) => {
            localStorage.setItem('adminName', newName);
            setUserName(newName);
          }}
        />
      </div>
    );
  }

  return (
    <>
      {currentView === 'login' ? (
        <Login 
          onForgotPasswordClick={() => setCurrentView('forgot-password')} 
          onLoginSuccess={handleLoginSuccess}
          initialMessage={loginMessage}
        />
      ) : (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div className="form-wrapper" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <ForgotPassword onBackToLogin={() => setCurrentView('login')} />
          </div>
        </div>
      )}
    </>
  );
}
