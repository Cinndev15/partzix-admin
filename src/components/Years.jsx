import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Loader2, AlertCircle, CheckCircle, Calendar, User, Edit2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';


export default function Years({ authToken, apiBaseUrl }) {
  const [yearsList, setYearsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states - Create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [yearVal, setYearVal] = useState('');
  const [status, setStatus] = useState('Activo');

  // Modal states - Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [editYearVal, setEditYearVal] = useState('');
  const [editStatus, setEditStatus] = useState('Activo');

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchYears = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`${apiBaseUrl}/years`);
      const resData = await response.json();
      if (resData.success) {
        setYearsList(resData.data);
      } else {
        setErrorMsg(resData.message || 'Error al cargar los años.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleCreateYear = async (e) => {
    e.preventDefault();
    const yearNum = parseInt(yearVal);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      setErrorMsg('Por favor ingresa un año válido (entre 1900 y 2100).');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/years`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ year: yearNum, status })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccessMsg('Año registrado con éxito.');
        setYearVal('');
        setStatus('Activo');
        fetchYears();
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(resData.message || 'Error al registrar el año.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (y) => {
    setSelectedYear(y);
    setEditYearVal(y.year);
    setEditStatus(y.status || 'Activo');
    setShowEditModal(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleUpdateYear = async (e) => {
    e.preventDefault();
    const yearNum = parseInt(editYearVal);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      setErrorMsg('Por favor ingresa un año válido (entre 1900 y 2100).');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/years/${selectedYear.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ year: yearNum, status: editStatus })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccessMsg('Año actualizado con éxito.');
        fetchYears();
        setTimeout(() => {
          setShowEditModal(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(resData.message || 'Error al actualizar el año.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (y) => {
    setErrorMsg('');
    const newStatus = y.status === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const response = await fetch(`${apiBaseUrl}/years/${y.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        fetchYears();
      } else {
        setErrorMsg(resData.message || 'Error al cambiar el estado del año.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error de conexión. No se pudo cambiar el estado.');
    }
  };

  const filteredYears = yearsList.filter(y => 
    y.year.toString().includes(searchQuery)
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredYears.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentYears = filteredYears.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div className="search-bar-container">
        <div>
          <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>Años de Vehículos</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Administra los años de compatibilidad de repuestos en la plataforma.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="input-container" style={{ minWidth: '280px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar año..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="input-icon" size={18} />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn-primary" 
            style={{ width: 'auto', display: 'inline-flex', padding: '0.85rem 1.25rem', cursor: 'pointer' }}
          >
            <Plus size={18} /> Nuevo Año
          </button>
        </div>
      </div>

      {errorMsg && !showCreateModal && !showEditModal && (
        <div className="alert alert-error" style={{ margin: '1rem 0' }}>
          <AlertCircle className="alert-icon" size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="spinner" size={32} />
        </div>
      ) : filteredYears.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '16px', marginTop: '1rem' }}>
          No se encontraron años.
        </div>
      ) : (
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Año</th>
                <th>Estado</th>
                <th>Creador</th>
                <th>Fecha de Creación</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentYears.map((y) => (
                <tr key={y.id}>
                  <td style={{ fontWeight: 600, color: '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} style={{ color: 'var(--accent)' }} />
                      {y.year}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${y.status === 'Activo' ? 'badge-approved' : 'badge-error'}`}>
                      {y.status || 'Activo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <User size={14} /> {y.creator_name || y.creator_email || 'Sistema'}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <Calendar size={14} className="text-muted" /> 
                      {y.created_at ? new Date(y.created_at).toISOString().split('T')[0] : 'N/A'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => openEditModal(y)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(y)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: y.status === 'Inactivo' ? '#10b981' : '#ef4444', cursor: 'pointer' }}
                      >
                        {y.status === 'Inactivo' ? 'Activar' : 'Desactivar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION FOOTER */}
          <div className="pagination-container">
            <div className="pagination-info">
              <span>
                Mostrando{' '}
                <strong>
                  {filteredYears.length === 0 ? 0 : indexOfFirstItem + 1}
                </strong>{' '}
                -{' '}
                <strong>
                  {Math.min(indexOfLastItem, filteredYears.length)}
                </strong>{' '}
                de <strong>{filteredYears.length}</strong> años
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem' }}>Por página:</span>
                <select
                  className="pagination-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  title="Primera página"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  title="Página anterior"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((p, idx) =>
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="pagination-ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      className={`pagination-btn ${safeCurrentPage === p ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  title="Página siguiente"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  title="Última página"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Nuevo Año</h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }} 
                className="modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <AlertCircle className="alert-icon" size={18} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                <CheckCircle className="alert-icon" size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateYear}>
              <div className="form-group">
                <label className="form-label" htmlFor="year-val">Año</label>
                <div className="input-container">
                  <input 
                    id="year-val"
                    type="number" 
                    className="form-input" 
                    placeholder="Ej. 2020"
                    value={yearVal}
                    onChange={(e) => setYearVal(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <Calendar className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="year-status">Estado</label>
                <div className="input-container">
                  <select 
                    id="year-status"
                    className="form-input" 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={actionLoading}
                    style={{ paddingLeft: '2.5rem', background: '#0b0f19', color: '#f3f4f6' }}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                  <Calendar className="input-icon" size={16} />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '1.5rem', width: '100%' }} 
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="spinner" size={18} /> : 'Registrar Año'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Editar Año</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }} 
                className="modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <AlertCircle className="alert-icon" size={18} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                <CheckCircle className="alert-icon" size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateYear}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-year-val">Año</label>
                <div className="input-container">
                  <input 
                    id="edit-year-val"
                    type="number" 
                    className="form-input" 
                    placeholder="Ej. 2020"
                    value={editYearVal}
                    onChange={(e) => setEditYearVal(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <Calendar className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="edit-year-status">Estado</label>
                <div className="input-container">
                  <select 
                    id="edit-year-status"
                    className="form-input" 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={actionLoading}
                    style={{ paddingLeft: '2.5rem', background: '#0b0f19', color: '#f3f4f6' }}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                  <Calendar className="input-icon" size={16} />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '1.5rem', width: '100%' }} 
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="spinner" size={18} /> : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
