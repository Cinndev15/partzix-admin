import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Warehouse, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Calendar, 
  DollarSign, 
  ShieldAlert, 
  Loader2, 
  ArrowUpRight,
  Plus,
  X,
  Mail,
  Phone,
  Check,
  MapPin,
  Globe,
  User,
  Hash,
  Eye,
  FileText,
  XCircle,
  ArrowLeft,
  Lock
} from 'lucide-react';
import Categories from './Categories';
import Lines from './Lines';
import Sublines from './Sublines';
import Models from './Models';
import Brands from './Brands';
import Years from './Years';
import Products from './Products';
import Taxes from './Taxes';
import Profile from './Profile';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://api.partzix.com/api';

export default function Dashboard({ activeTab, setActiveTab, authToken, userEmail, userName, onProfileUpdate }) {
  const resolveDocUrl = (path) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    if (path.includes('mock_')) {
      return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf-test.pdf';
    }
    const baseServerUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseServerUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // warehouseId being approved/rejected
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Warehouse Detail View (Full Page) State
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [selectedWarehouse]);

  // Create User Modal States
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserEmail, setCreateUserEmail] = useState('');
  const [createUserPassword, setCreateUserPassword] = useState('');
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState('');

  // Warehouse Registration Form State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regStep, setRegStep] = useState(1); // 1: Email/OTP, 2: Verify OTP, 3: Create details
  const [regEmail, setRegEmail] = useState('');
  const [regOtp, setRegOtp] = useState(['', '', '', '', '', '']);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  
  // Registration Form Fields (Step 3)
  const [regNit, setRegNit] = useState('');
  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regDepartment, setRegDepartment] = useState('Antioquia');
  const [regCity, setRegCity] = useState('Medellín');
  const [regPhone, setRegPhone] = useState('');
  const [regContactPerson, setRegContactPerson] = useState('');
  const [regUserClass, setRegUserClass] = useState('Empresa de autopartes');
  const [regWebsite, setRegWebsite] = useState('');

  const regOtpRefs = useRef([]);

  // Fetch all registered warehouses
  const fetchWarehouses = async () => {
    if (!authToken) return;
    setLoading(true);
    setApiError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/warehouses`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAllWarehouses(data.data || []);
        // Update selectedWarehouse details if currently open to ensure fresh data
        if (selectedWarehouse) {
          const fresh = (data.data || []).find(w => w.warehouse_id === selectedWarehouse.warehouse_id);
          if (fresh) setSelectedWarehouse(fresh);
        }
      } else {
        setApiError(data.message || 'No se pudieron cargar los almacenes.');
        setMockData();
      }
    } catch (err) {
      setApiError('Error de conexión con la API.');
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setAllWarehouses([
      { 
        warehouse_id: 'w1', 
        business_name: 'Autopartes El Poblado', 
        email: 'contacto@autopartespoblado.com', 
        status: 'Aprobado', 
        user_class: 'Autos', 
        registration_date: '2026-07-10T12:00:00.000Z', 
        phone: '+57 312 456 7890', 
        city: 'Medellín',
        identification_number: '901234567',
        address: 'Calle 10 # 43A - 50',
        department: 'Antioquia',
        contact_person: 'Alejandro Restrepo',
        website: 'https://autopartespoblado.com',
        short_name: 'El Poblado',
        description: 'Distribuidor líder de autopartes para vehículos particulares.',
        rut_doc_path: '/uploads/mock_rut.pdf',
        id_doc_path: '/uploads/mock_id.pdf',
        chamber_of_commerce_doc_path: '/uploads/mock_chamber.pdf',
        logo_path: null,
        registrar_name: 'Alejandro Restrepo',
        user_id: 2
      },
      { 
        warehouse_id: 'w2', 
        business_name: 'Repuestos MotoExpress', 
        email: 'ventas@motoexpress.co', 
        status: 'Aprobado', 
        user_class: 'Motos', 
        registration_date: '2026-07-12T12:00:00.000Z', 
        phone: '+57 300 987 6543', 
        city: 'Bogotá',
        identification_number: '900555444',
        address: 'Av. Caracas # 45 - 20',
        department: 'Bogotá D.C.',
        contact_person: 'Milena Gomez',
        website: 'https://motoexpress.co',
        short_name: 'MotoExpress',
        description: 'Especialistas en repuestos y accesorios para motos de bajo y alto cilindraje.',
        rut_doc_path: '/uploads/mock_rut.pdf',
        id_doc_path: '/uploads/mock_id.pdf',
        chamber_of_commerce_doc_path: '/uploads/mock_chamber.pdf',
        logo_path: null,
        registrar_name: 'Milena Gomez',
        user_id: 3
      },
      { 
        warehouse_id: 'w3', 
        business_name: 'Frenos y Suspensión Cali', 
        email: 'califrenos@hotmail.com', 
        status: 'Aprobado', 
        user_class: 'Vehículos Pesados', 
        registration_date: '2026-07-14T12:00:00.000Z', 
        phone: '+57 315 222 1100', 
        city: 'Cali',
        identification_number: '800555333',
        address: 'Carrera 15 # 21 - 80',
        department: 'Valle del Cauca',
        contact_person: 'Eduardo Calixto',
        website: null,
        short_name: 'Cali Frenos',
        description: 'Importadores de bandas de freno y suspensión para camiones.',
        rut_doc_path: '/uploads/mock_rut.pdf',
        id_doc_path: '/uploads/mock_id.pdf',
        chamber_of_commerce_doc_path: '/uploads/mock_chamber.pdf',
        logo_path: null,
        registrar_name: 'Eduardo Calixto',
        user_id: 4
      },
      { 
        warehouse_id: 'w4', 
        business_name: 'Distribuidora FrenoMax Colombia', 
        email: 'gerencia@frenomax.com', 
        status: 'Por Aprobar', 
        user_class: 'Autos', 
        registration_date: '2026-07-16T12:00:00.000Z', 
        phone: '+57 321 888 7766', 
        city: 'Barranquilla',
        identification_number: '900999888',
        address: 'Calle 72 # 54 - 30',
        department: 'Atlántico',
        contact_person: 'Gustavo Fring',
        website: 'https://frenomax.com.co',
        short_name: 'FrenoMax',
        description: 'Distribuidor nacional de pastillas de freno cerámicas.',
        rut_doc_path: '/uploads/mock_rut.pdf',
        id_doc_path: '/uploads/mock_id.pdf',
        chamber_of_commerce_doc_path: '/uploads/mock_chamber.pdf',
        logo_path: null,
        registrar_name: 'Gustavo Fring',
        user_id: null
      },
      { 
        warehouse_id: 'w5', 
        business_name: 'Pesados del Caribe S.A.S.', 
        email: 'admin@pesadoscaribe.com', 
        status: 'Por Aprobar', 
        user_class: 'Vehículos Pesados', 
        registration_date: '2026-07-17T12:00:00.000Z', 
        phone: '+57 310 555 4433', 
        city: 'Cartagena',
        identification_number: '900888111',
        address: 'Zona Franca Mamonal Bodega 12',
        department: 'Bolívar',
        contact_person: 'Maritza Mendez',
        website: null,
        short_name: 'Pesados Caribe',
        description: 'Soporte logístico y repuestos pesados para tractomulas.',
        rut_doc_path: '/uploads/mock_rut.pdf',
        id_doc_path: '/uploads/mock_id.pdf',
        chamber_of_commerce_doc_path: '/uploads/mock_chamber.pdf',
        logo_path: null,
        registrar_name: 'Maritza Mendez',
        user_id: null
      }
    ]);
  };

  useEffect(() => {
    fetchWarehouses();
  }, [authToken]);

  // Handle status update (Approve / Reject)
  const handleUpdateStatus = async (warehouseId, name, newStatus) => {
    setActionLoading(warehouseId);
    setApiError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/warehouses/${warehouseId}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(`El almacén "${name}" ha sido ${newStatus === 'Aprobado' ? 'aprobado' : 'rechazado'} exitosamente.`);
        // Refresh local details view model status
        setSelectedWarehouse(prev => prev ? { ...prev, status: newStatus } : null);
        fetchWarehouses();
      } else {
        setApiError(data.message || 'Error al actualizar el estado del almacén.');
        simulateStatusUpdate(warehouseId, name, newStatus);
      }
    } catch (err) {
      simulateStatusUpdate(warehouseId, name, newStatus);
    } finally {
      setActionLoading(null);
    }
  };

  const simulateStatusUpdate = (warehouseId, name, newStatus) => {
    setSuccessMsg(`Simulación: El almacén "${name}" ha sido ${newStatus === 'Aprobado' ? 'aprobado' : 'rechazado'}.`);
    setSelectedWarehouse(prev => prev ? { ...prev, status: newStatus } : null);
    setAllWarehouses(prev => prev.map(w => w.warehouse_id === warehouseId ? { ...w, status: newStatus } : w));
  };

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createUserEmail || !createUserPassword) {
      setCreateUserError('Por favor completa todos los campos.');
      return;
    }

    setCreateUserLoading(true);
    setCreateUserError('');
    setCreateUserSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/admin/warehouses/${selectedWarehouse.warehouse_id}/user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: createUserEmail,
          password: createUserPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        setCreateUserSuccess('Cuenta de usuario creada con éxito.');
        setSuccessMsg(data.message || `Se ha creado el usuario "${createUserEmail}" para este almacén.`);
        setTimeout(() => {
          setShowCreateUserModal(false);
          setCreateUserPassword('');
          fetchWarehouses();
        }, 1500);
      } else {
        setCreateUserError(data.message || 'Error al crear la cuenta de usuario.');
        simulateCreateUser();
      }
    } catch (err) {
      simulateCreateUser();
    } finally {
      setCreateUserLoading(false);
    }
  };

  const simulateCreateUser = () => {
    setCreateUserSuccess('Simulación: Cuenta de usuario creada con éxito.');
    setSuccessMsg(`Simulación: Se ha creado el usuario "${createUserEmail}" para este almacén.`);
    setTimeout(() => {
      setShowCreateUserModal(false);
      setCreateUserPassword('');
      setAllWarehouses(prev => prev.map(w => w.warehouse_id === selectedWarehouse.warehouse_id ? { ...w, user_id: 999, user_email: createUserEmail } : w));
    }, 1500);
  };

  // MULTI-STEP WAREHOUSE REGISTRATION HANDLERS
  
  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!regEmail) return;

    setRegLoading(true);
    setRegError('');
    setRegSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setRegSuccess('Código OTP enviado al correo ingresado.');
        setRegStep(2);
      } else {
        setRegError(data.message || 'Error al enviar código OTP.');
        setRegSuccess('Simulación: Código OTP enviado.');
        setRegStep(2);
      }
    } catch (err) {
      setRegSuccess('Simulación: Código OTP enviado.');
      setRegStep(2);
    } finally {
      setRegLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = regOtp.join('');
    if (otpCode.length !== 6) {
      setRegError('Ingresa el código completo de 6 dígitos.');
      return;
    }

    setRegLoading(true);
    setRegError('');
    setRegSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, code: otpCode })
      });
      const data = await response.json();
      if (response.ok) {
        setRegSuccess('Correo verificado correctamente. Ingresa los datos del almacén.');
        setRegStep(3);
      } else {
        setRegError(data.message || 'El código ingresado es incorrecto o expiró.');
        setRegSuccess('Simulación: Correo verificado.');
        setRegStep(3);
      }
    } catch (err) {
      setRegSuccess('Simulación: Correo verificado.');
      setRegStep(3);
    } finally {
      setRegLoading(false);
    }
  };

  // Step 3: Register details
  const handleRegisterWarehouse = async (e) => {
    e.preventDefault();
    if (!regNit || !regName || !regAddress || !regDepartment || !regCity || !regUserClass) {
      setRegError('Por favor completa todos los campos requeridos.');
      return;
    }

    setRegLoading(true);
    setRegError('');
    setRegSuccess('');

    const payload = {
      identification_number: regNit,
      name: regName,
      address: regAddress,
      country: 'Colombia',
      department: regDepartment,
      city: regCity,
      phone: regPhone || null,
      contact_person: regContactPerson || null,
      user_class: regUserClass,
      website: regWebsite || null,
      email: regEmail
    };

    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(`El almacén "${regName}" ha sido registrado con éxito.`);
        resetRegForm();
        fetchWarehouses();
      } else {
        setRegError(data.message || 'Error al guardar los datos del almacén.');
        simulateRegistration();
      }
    } catch (err) {
      simulateRegistration();
    } finally {
      setRegLoading(false);
    }
  };

  const simulateRegistration = () => {
    setSuccessMsg(`Simulación: El almacén "${regName}" ha sido registrado.`);
    resetRegForm();
    const simulated = {
      warehouse_id: `w_${Date.now()}`,
      identification_number: regNit,
      business_name: regName,
      email: regEmail,
      status: 'Por Aprobar',
      user_class: regUserClass,
      phone: regPhone || 'Sin teléfono',
      city: regCity,
      registration_date: new Date().toISOString(),
      address: regAddress,
      department: regDepartment,
      contact_person: regContactPerson || 'Sin contacto',
      website: regWebsite || null,
      short_name: regName.slice(0, 15),
      description: 'Registro ingresado desde el Panel de Administración.',
      rut_doc_path: '/uploads/mock_rut.pdf',
      id_doc_path: '/uploads/mock_id.pdf',
      chamber_of_commerce_doc_path: '/uploads/mock_chamber.pdf',
      logo_path: null,
      registrar_name: regContactPerson || 'Administrador',
      user_id: null
    };
    setAllWarehouses(prev => [simulated, ...prev]);
  };

  const resetRegForm = () => {
    setShowRegModal(false);
    setRegStep(1);
    setRegEmail('');
    setRegOtp(['', '', '', '', '', '']);
    setRegNit('');
    setRegName('');
    setRegAddress('');
    setRegDepartment('Antioquia');
    setRegCity('Medellín');
    setRegPhone('');
    setRegContactPerson('');
    setRegUserClass('Empresa de autopartes');
    setRegWebsite('');
    setRegError('');
    setRegSuccess('');
  };

  const handleRegOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...regOtp];
    newOtp[index] = value.slice(-1);
    setRegOtp(newOtp);
    if (value && index < 5) {
      regOtpRefs.current[index + 1].focus();
    }
  };

  const handleRegOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !regOtp[index] && index > 0) {
      regOtpRefs.current[index - 1].focus();
    }
  };

  const pendingWarehouses = allWarehouses.filter(w => w.status === 'Por Aprobar' || w.status === 'pending');
  const approvedWarehouses = allWarehouses.filter(w => w.status === 'Aprobado' || w.status === 'approved');

  const filteredWarehouses = allWarehouses.filter(w => {
    // Show only warehouses that have completed registration / uploaded documents
    const hasProfile = !!(w.short_name || w.registrar_name || w.rut_doc_path);
    if (!hasProfile) return false;

    const term = searchQuery.toLowerCase();
    const name = (w.business_name || w.name || '').toLowerCase();
    const email = (w.email || '').toLowerCase();
    const type = (w.user_class || w.specialty || '').toLowerCase();
    return name.includes(term) || email.includes(term) || type.includes(term);
  });

  const salesMetrics = {
    totalRevenue: '$158,450,000 COP',
    monthlyGrowth: '+14.2%',
    totalSalesCount: 1248,
    averageTicket: '$126,900 COP'
  };

  const monthlySales = [
    { month: 'Ene', amount: 12000000, height: '45%' },
    { month: 'Feb', amount: 15400000, height: '58%' },
    { month: 'Mar', amount: 18900000, height: '70%' },
    { month: 'Abr', amount: 14200000, height: '52%' },
    { month: 'May', amount: 22000000, height: '82%' },
    { month: 'Jun', amount: 26800000, height: '100%' }
  ];

  const topStores = [
    { name: 'Autopartes El Poblado', sales: 485, revenue: '$61,500,000 COP' },
    { name: 'Repuestos MotoExpress', sales: 390, revenue: '$49,200,000 COP' },
    { name: 'Frenos y Suspensión Cali', sales: 220, revenue: '$28,100,000 COP' },
    { name: 'Distribuidora FrenoMax', sales: 153, revenue: '$19,650,000 COP' }
  ];

  // RENDER DEDICATED DETAIL PAGE (FULL VIEW)
  if (selectedWarehouse) {
    return (
      <div className="dash-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <button 
            onClick={() => {
              setSelectedWarehouse(null);
              setApiError('');
              setSuccessMsg('');
            }} 
            className="btn-secondary" 
            style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} /> Volver a la lista
          </button>
        </div>

        {/* Notifications */}
        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <ShieldAlert className="alert-icon" size={18} />
            <span>{apiError}</span>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <CheckCircle className="alert-icon" size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          {/* Header section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              {selectedWarehouse.logo_path && !logoError ? (
                <img 
                  src={resolveDocUrl(selectedWarehouse.logo_path)} 
                  alt="Logo" 
                  style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }} 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'rgba(255, 85, 0, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  <Warehouse size={32} style={{ color: 'var(--accent)' }} />
                </div>
              )}
              <div>
                <span className={`badge ${selectedWarehouse.status === 'Aprobado' || selectedWarehouse.status === 'approved' ? 'badge-approved' : selectedWarehouse.status === 'Negado' ? 'badge-error' : 'badge-pending'}`} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                  {selectedWarehouse.status === 'Aprobado' || selectedWarehouse.status === 'approved' ? 'Aprobado' : selectedWarehouse.status === 'Negado' ? 'Rechazado/Bloqueado' : 'Pendiente de Aprobación'}
                </span>
                <h2 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#111827' }}>
                  {selectedWarehouse.business_name || selectedWarehouse.name}
                </h2>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {/* If Pending / Por Aprobar */}
              {(selectedWarehouse.status === 'Por Aprobar' || selectedWarehouse.status === 'pending') && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(selectedWarehouse.warehouse_id, selectedWarehouse.business_name || selectedWarehouse.name, 'Negado')} 
                    className="btn-secondary" 
                    style={{ width: 'auto', padding: '0.75rem 1.25rem', borderColor: 'var(--error)', color: 'var(--error)', display: 'inline-flex', gap: '0.25rem', alignItems: 'center', cursor: 'pointer' }}
                    disabled={actionLoading === selectedWarehouse.warehouse_id}
                  >
                    <XCircle size={16} /> Rechazar Almacén
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedWarehouse.warehouse_id, selectedWarehouse.business_name || selectedWarehouse.name, 'Aprobado')} 
                    className="btn-primary" 
                    style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'inline-flex', gap: '0.25rem', alignItems: 'center', cursor: 'pointer' }}
                    disabled={actionLoading === selectedWarehouse.warehouse_id}
                  >
                    <CheckCircle size={16} /> Aprobar Almacén
                  </button>
                </>
              )}

              {/* If Approved */}
              {(selectedWarehouse.status === 'Aprobado' || selectedWarehouse.status === 'approved') && (
                <>
                  {/* Account Creation Status / Button */}
                  {selectedWarehouse.user_id ? (
                    <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#f0fdf4', padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                      <CheckCircle size={16} /> Usuario Creado ({selectedWarehouse.email})
                    </span>
                  ) : (
                    <button 
                      onClick={() => {
                        setCreateUserEmail(selectedWarehouse.email);
                        setShowCreateUserModal(true);
                      }} 
                      className="btn-primary" 
                      style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'inline-flex', gap: '0.35rem', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <User size={16} /> Crear Usuario
                    </button>
                  )}

                  {/* Block Warehouse Button */}
                  <button 
                    onClick={() => handleUpdateStatus(selectedWarehouse.warehouse_id, selectedWarehouse.business_name || selectedWarehouse.name, 'Negado')} 
                    className="btn-secondary" 
                    style={{ width: 'auto', padding: '0.75rem 1.25rem', borderColor: 'var(--error)', color: 'var(--error)', display: 'inline-flex', gap: '0.25rem', alignItems: 'center', cursor: 'pointer' }}
                    disabled={actionLoading === selectedWarehouse.warehouse_id}
                  >
                    <XCircle size={16} /> Bloquear Almacén
                  </button>
                </>
              )}

              {/* If Denied / Negado (Blocked) */}
              {selectedWarehouse.status === 'Negado' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedWarehouse.warehouse_id, selectedWarehouse.business_name || selectedWarehouse.name, 'Aprobado')} 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'inline-flex', gap: '0.25rem', alignItems: 'center', cursor: 'pointer' }}
                  disabled={actionLoading === selectedWarehouse.warehouse_id}
                >
                  <CheckCircle size={16} /> Desbloquear Almacén
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
            {/* Left Section: Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.2rem', color: 'var(--accent)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', width: 'fit-content' }}>
                Información del Registro
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>NIT / RUT</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginTop: '0.2rem' }}>{selectedWarehouse.identification_number}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Especialidad</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginTop: '0.2rem' }}>{selectedWarehouse.user_class || selectedWarehouse.specialty || 'General'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email de Contacto</span>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{selectedWarehouse.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Teléfono</span>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{selectedWarehouse.phone || 'No registrado'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Persona Responsable</span>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{selectedWarehouse.contact_person || 'No registrado'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sitio Web</span>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {selectedWarehouse.website ? (
                      <a href={selectedWarehouse.website.startsWith('http') ? selectedWarehouse.website : `https://${selectedWarehouse.website}`} target="_blank" rel="noopener noreferrer" className="link-accent">
                        {selectedWarehouse.website}
                      </a>
                    ) : 'No registrado'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha de Registro</span>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {selectedWarehouse.registration_date ? new Date(selectedWarehouse.registration_date).toISOString().split('T')[0] : 'Reciente'}
                  </p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dirección Principal</span>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {selectedWarehouse.address} • {selectedWarehouse.city}, {selectedWarehouse.department} ({selectedWarehouse.country || 'Colombia'})
                  </p>
                </div>
              </div>

              {(selectedWarehouse.short_name || selectedWarehouse.description) && (
                <div style={{ marginTop: '1rem', background: '#f9fafb', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Descripción de la Empresa</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.35rem' }}>
                    {selectedWarehouse.description}
                  </p>
                  {selectedWarehouse.registrar_name && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                      Registrado por: <strong>{selectedWarehouse.registrar_name}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Section: Attached Documents */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.2rem', color: 'var(--accent)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', width: 'fit-content' }}>
                Documentos Adjuntos
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* RUT */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', background: '#f9fafb', border: '1px solid var(--border)', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255, 85, 0, 0.08)', padding: '0.75rem', borderRadius: '10px' }}>
                      <FileText size={24} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Registro Único Tributario (RUT)</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Copia oficial en formato PDF</p>
                    </div>
                  </div>
                  {selectedWarehouse.rut_doc_path ? (
                    <a 
                      href={resolveDocUrl(selectedWarehouse.rut_doc_path)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-primary" 
                      style={{ width: '150px', justifyContent: 'center', padding: '0.55rem 1.1rem', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                    >
                      <Eye size={14} /> Abrir RUT
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="btn-secondary" 
                      style={{ width: '150px', justifyContent: 'center', padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'not-allowed', opacity: 0.5, background: '#f3f4f6', borderColor: '#e5e7eb', color: '#9ca3af' }}
                    >
                      No Adjunto
                    </button>
                  )}
                </div>

                {/* ID REPRESENTATIVE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', background: '#f9fafb', border: '1px solid var(--border)', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255, 85, 0, 0.08)', padding: '0.75rem', borderRadius: '10px' }}>
                      <FileText size={24} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Cédula Representante Legal</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cédula por ambas caras</p>
                    </div>
                  </div>
                  {selectedWarehouse.id_doc_path ? (
                    <a 
                      href={resolveDocUrl(selectedWarehouse.id_doc_path)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-primary" 
                      style={{ width: '150px', justifyContent: 'center', padding: '0.55rem 1.1rem', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                    >
                      <Eye size={14} /> Abrir Cédula
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="btn-secondary" 
                      style={{ width: '150px', justifyContent: 'center', padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'not-allowed', opacity: 0.5, background: '#f3f4f6', borderColor: '#e5e7eb', color: '#9ca3af' }}
                    >
                      No Adjunto
                    </button>
                  )}
                </div>

                {/* CHAMBER OF COMMERCE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', background: '#f9fafb', border: '1px solid var(--border)', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255, 85, 0, 0.08)', padding: '0.75rem', borderRadius: '10px' }}>
                      <FileText size={24} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Cámara de Comercio</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Certificado mercantil menor a 90 días</p>
                    </div>
                  </div>
                  {selectedWarehouse.chamber_of_commerce_doc_path ? (
                    <a 
                      href={resolveDocUrl(selectedWarehouse.chamber_of_commerce_doc_path)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-primary" 
                      style={{ width: '150px', justifyContent: 'center', padding: '0.55rem 1.1rem', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                    >
                      <Eye size={14} /> Abrir Cámara
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="btn-secondary" 
                      style={{ width: '150px', justifyContent: 'center', padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'not-allowed', opacity: 0.5, background: '#f3f4f6', borderColor: '#e5e7eb', color: '#9ca3af' }}
                    >
                      No Adjunto
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CREATE USER MODAL */}
        {showCreateUserModal && (
          <div className="modal-backdrop">
            <div className="modal-card" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h3 className="modal-title">Crear Cuenta de Usuario</h3>
                <button 
                  onClick={() => {
                    setShowCreateUserModal(false);
                    setCreateUserError('');
                    setCreateUserSuccess('');
                  }} 
                  className="modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              {createUserError && (
                <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                  <AlertCircle className="alert-icon" size={18} />
                  <span>{createUserError}</span>
                </div>
              )}
              {createUserSuccess && (
                <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                  <CheckCircle className="alert-icon" size={18} />
                  <span>{createUserSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label className="form-label" htmlFor="user-email">Correo Electrónico de Acceso</label>
                  <div className="input-container">
                    <input 
                      id="user-email"
                      type="email" 
                      className="form-input" 
                      value={createUserEmail}
                      onChange={(e) => setCreateUserEmail(e.target.value)}
                      disabled={createUserLoading}
                      required
                    />
                    <Mail className="input-icon" size={18} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="user-password">Contraseña Temporal</label>
                  <div className="input-container">
                    <input 
                      id="user-password"
                      type="password" 
                      className="form-input" 
                      placeholder="Ingrese contraseña para el almacén"
                      value={createUserPassword}
                      onChange={(e) => setCreateUserPassword(e.target.value)}
                      disabled={createUserLoading}
                      required
                    />
                    <Lock className="input-icon" size={18} />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={createUserLoading}>
                  {createUserLoading ? <Loader2 className="spinner" size={18} /> : 'Crear Usuario'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dash-content">
      {/* Notifications */}
      {apiError && (
        <div className="alert alert-error">
          <ShieldAlert className="alert-icon" size={18} />
          <span>{apiError}</span>
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle className="alert-icon" size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB CONTENT: RESUMEN */}
      {activeTab === 'resumen' && (
        <div>
          <div className="metrics-grid">
            <div className="dashboard-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <span>Almacenes Registrados</span>
                <Warehouse size={20} />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>{allWarehouses.length}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {approvedWarehouses.length} aprobados / {pendingWarehouses.length} pendientes
              </p>
            </div>

            <div className="dashboard-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <span>Ventas Totales</span>
                <DollarSign size={20} />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>{salesMetrics.totalRevenue}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <ArrowUpRight size={14} /> <span>{salesMetrics.monthlyGrowth} este mes</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <span>Transacciones Realizadas</span>
                <TrendingUp size={20} />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>{salesMetrics.totalSalesCount}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Ticket promedio: {salesMetrics.averageTicket}
              </p>
            </div>

            <div className="dashboard-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <span>Registros Pendientes</span>
                <Clock size={20} style={{ color: pendingWarehouses.length > 0 ? '#f59e0b' : 'inherit' }} />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: pendingWarehouses.length > 0 ? '#f59e0b' : 'inherit' }}>
                {pendingWarehouses.length}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Requieren revisión inmediata del administrador.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} style={{ color: '#f59e0b' }} /> Aprobaciones Pendientes
                </h3>
                <button onClick={() => setActiveTab('almacenes')} className="link-accent" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  Ver todos
                </button>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <Loader2 className="spinner" size={24} />
                </div>
              ) : pendingWarehouses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No hay almacenes pendientes de aprobación.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingWarehouses.slice(0, 3).map((w) => (
                    <div 
                      key={w.warehouse_id} 
                      onClick={() => setSelectedWarehouse(w)} 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 85, 0, 0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.01)'}
                    >
                      <div>
                        <p style={{ fontWeight: 600, color: '#111827' }}>{w.business_name || w.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{w.email} • {w.user_class || w.specialty || 'General'}</p>
                      </div>
                      <span className="link-accent" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Revisar →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} /> Historial de Ventas
                </h3>
                <button onClick={() => setActiveTab('ventas')} className="link-accent" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  Detalles
                </button>
              </div>

              <div className="sales-chart-bar-container" style={{ height: '140px' }}>
                {monthlySales.slice(2).map((s, idx) => (
                  <div key={idx} className="chart-bar-column">
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar-fill" style={{ height: s.height }}></div>
                    </div>
                    <span className="chart-bar-label">{s.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ALMACENES REGISTRADOS */}
      {activeTab === 'almacenes' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div className="search-bar-container">
            <div>
              <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>Administración de Almacenes</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lista total de almacenes registrados y pendientes de aprobación.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="input-container" style={{ minWidth: '280px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Buscar almacén, correo, especialidad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="input-icon" size={18} />
              </div>
              <button 
                onClick={() => setShowRegModal(true)} 
                className="btn-primary" 
                style={{ width: 'auto', display: 'inline-flex', padding: '0.85rem 1.25rem', cursor: 'pointer' }}
              >
                <Plus size={18} /> Registrar Almacén
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 className="spinner" size={32} />
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
              No se encontraron almacenes con el filtro actual.
            </div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre Comercial</th>
                    <th>Email / Teléfono</th>
                    <th>Especialidad</th>
                    <th>Fecha Registro</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWarehouses.map((w) => (
                    <tr 
                      key={w.warehouse_id} 
                      onClick={() => setSelectedWarehouse(w)}
                    >
                      <td style={{ fontWeight: 600, color: '#111827' }}>{w.business_name || w.name}</td>
                      <td>
                        <div>{w.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{w.phone || 'Sin teléfono'}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.02)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          {w.user_class || w.specialty || 'General'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <Calendar size={14} className="text-muted" /> {w.registration_date ? new Date(w.registration_date).toISOString().split('T')[0] : 'Reciente'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${w.status === 'Aprobado' || w.status === 'approved' ? 'badge-approved' : w.status === 'Negado' ? 'badge-error' : 'badge-pending'}`}>
                          {w.status === 'Aprobado' || w.status === 'approved' ? 'Aprobado' : w.status === 'Negado' ? 'Rechazado' : 'Por Aprobar'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: VENTAS & ESTADÍSTICAS */}
      {activeTab === 'ventas' && (
        <div className="chart-card">
          <div className="metrics-grid">
            <div className="dashboard-card" style={{ borderLeft: '4px solid var(--success)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ventas Netas Totales</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>$158,450,000 COP</p>
            </div>
            
            <div className="dashboard-card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Comisión Partzix (5%)</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>$7,922,500 COP</p>
            </div>

            <div className="dashboard-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ticket de Compra Medio</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>$126,900 COP</p>
            </div>
          </div>

          <div className="chart-grid">
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Monto de Ventas Mensuales (Millones COP)</h3>
              
              <div className="sales-chart-bar-container">
                {monthlySales.map((s, idx) => (
                  <div key={idx} className="chart-bar-column">
                    <span className="chart-bar-value">${(s.amount / 1000000).toFixed(1)}M</span>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar-fill" style={{ height: s.height }}></div>
                    </div>
                    <span className="chart-bar-label">{s.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Almacenes Líderes en Ventas</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {topStores.map((store, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{store.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{store.sales} pedidos</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.95rem' }}>{store.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CATEGORIAS */}
      {activeTab === 'categorias' && (
        <Categories authToken={authToken} apiBaseUrl={API_BASE_URL} />
      )}

      {/* TAB CONTENT: LINEAS */}
      {activeTab === 'lineas' && (
        <Lines authToken={authToken} apiBaseUrl={API_BASE_URL} />
      )}

      {/* TAB CONTENT: SUBLINEAS */}
      {activeTab === 'sublineas' && (
        <Sublines authToken={authToken} apiBaseUrl={API_BASE_URL} />
      )}

      {/* TAB CONTENT: MODELOS */}
      {activeTab === 'modelos' && (
        <Models authToken={authToken} apiBaseUrl={API_BASE_URL} />
      )}

      {/* TAB CONTENT: MARCAS */}
      {activeTab === 'marcas' && (
        <Brands authToken={authToken} apiBaseUrl={API_BASE_URL} />
      )}

      {/* TAB CONTENT: ANOS */}
      {activeTab === 'anos' && (
        <Years authToken={authToken} apiBaseUrl={API_BASE_URL} />
      )}

      {/* TAB CONTENT: PRODUCTOS */}
      {activeTab === 'productos' && (
        <Products authToken={authToken} apiBaseUrl={API_BASE_URL} />
      )}

      {/* TAB CONTENT: IMPUESTOS */}
      {activeTab === 'impuestos' && (
        <Taxes authToken={authToken} apiBaseUrl={API_BASE_URL} />
      )}

      {/* TAB CONTENT: PERFIL */}
      {activeTab === 'perfil' && (
        <Profile 
          authToken={authToken} 
          apiBaseUrl={API_BASE_URL} 
          userEmail={userEmail} 
          onProfileUpdate={onProfileUpdate}
        />
      )}

      {/* REGISTRATION MODAL FORM */}
      {showRegModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: regStep === 3 ? '600px' : '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Registrar Nuevo Almacén</h3>
              <button onClick={resetRegForm} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="steps-container">
              <div className={`step-indicator ${regStep >= 1 ? 'completed' : ''} ${regStep === 1 ? 'active' : ''}`}>
                {regStep > 1 ? <Check size={16} /> : '1'}
              </div>
              <div className={`step-indicator ${regStep >= 2 ? 'completed' : ''} ${regStep === 2 ? 'active' : ''}`}>
                {regStep > 2 ? <Check size={16} /> : '2'}
              </div>
              <div className={`step-indicator ${regStep === 3 ? 'active' : ''}`}>
                3
              </div>
            </div>

            {regError && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <AlertCircle className="alert-icon" size={18} />
                <span>{regError}</span>
              </div>
            )}
            {regSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                <CheckCircle className="alert-icon" size={18} />
                <span>{regSuccess}</span>
              </div>
            )}

            {/* STEP 1: OTP REQUEST */}
            {regStep === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">Correo Electrónico del Almacén</label>
                  <div className="input-container">
                    <input 
                      id="reg-email"
                      type="email" 
                      className="form-input" 
                      placeholder="ejemplo@almacen.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      disabled={regLoading}
                      required
                    />
                    <Mail className="input-icon" size={18} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={regLoading}>
                  {regLoading ? <Loader2 className="spinner" size={18} /> : 'Enviar Código OTP'}
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {regStep === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label className="form-label">Código de Verificación (Enviado a tu email)</label>
                  <div className="otp-container">
                    {regOtp.map((digit, index) => (
                      <input 
                        key={index}
                        ref={(el) => (regOtpRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        className="otp-input"
                        value={digit}
                        onChange={(e) => handleRegOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleRegOtpKeyDown(index, e)}
                        disabled={regLoading}
                        required
                      />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setRegStep(1)} className="btn-secondary" style={{ flex: 1 }}>
                    Atrás
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={regLoading}>
                    {regLoading ? <Loader2 className="spinner" size={18} /> : 'Verificar Código'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: CREATION DETAILS */}
            {regStep === 3 && (
              <form onSubmit={handleRegisterWarehouse}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-nit">NIT / RUT</label>
                    <div className="input-container">
                      <input 
                        id="reg-nit"
                        type="text" 
                        className="form-input" 
                        placeholder="NIT sin guión ni dígito"
                        value={regNit}
                        onChange={(e) => setRegNit(e.target.value)}
                        disabled={regLoading}
                        required
                      />
                      <Hash className="input-icon" size={16} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-name">Razón Social</label>
                    <div className="input-container">
                      <input 
                        id="reg-name"
                        type="text" 
                        className="form-input" 
                        placeholder="Nombre comercial"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        disabled={regLoading}
                        required
                      />
                      <Warehouse className="input-icon" size={16} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-address">Dirección</label>
                  <div className="input-container">
                    <input 
                      id="reg-address"
                      type="text" 
                      className="form-input" 
                      placeholder="Dirección del almacén principal"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      disabled={regLoading}
                      required
                    />
                    <MapPin className="input-icon" size={16} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-dept">Departamento</label>
                    <input 
                      id="reg-dept"
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem' }}
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      disabled={regLoading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-city">Ciudad</label>
                    <input 
                      id="reg-city"
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem' }}
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      disabled={regLoading}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-phone">Teléfono</label>
                    <div className="input-container">
                      <input 
                        id="reg-phone"
                        type="text" 
                        className="form-input" 
                        placeholder="+57 300..."
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        disabled={regLoading}
                      />
                      <Phone className="input-icon" size={16} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-contact">Contacto Responsable</label>
                    <div className="input-container">
                      <input 
                        id="reg-contact"
                        type="text" 
                        className="form-input" 
                        placeholder="Nombre completo"
                        value={regContactPerson}
                        onChange={(e) => setRegContactPerson(e.target.value)}
                        disabled={regLoading}
                      />
                      <User className="input-icon" size={16} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-class">Especialidad</label>
                    <select 
                      id="reg-class"
                      className="form-input" 
                      style={{ paddingLeft: '1rem' }}
                      value={regUserClass}
                      onChange={(e) => setRegUserClass(e.target.value)}
                      disabled={regLoading}
                    >
                      <option value="Empresa de autopartes">Empresa de autopartes (Autos)</option>
                      <option value="Motos">Motos / Repuestos Motes</option>
                      <option value="Vehículos Pesados">Vehículos Pesados / Camiones</option>
                      <option value="Multimarca">Multimarca</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-web">Sitio Web (Opcional)</label>
                    <div className="input-container">
                      <input 
                        id="reg-web"
                        type="text" 
                        className="form-input" 
                        placeholder="https://..."
                        value={regWebsite}
                        onChange={(e) => setRegWebsite(e.target.value)}
                        disabled={regLoading}
                      />
                      <Globe className="input-icon" size={16} />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={regLoading}>
                  {regLoading ? <Loader2 className="spinner" size={18} /> : 'Completar Registro'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
