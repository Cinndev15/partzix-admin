import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Loader2, AlertCircle, CheckCircle, Layers, GitFork, Calendar, User, FileText, Edit2, Tag } from 'lucide-react';

export default function Sublines({ authToken, apiBaseUrl }) {
  const [sublines, setSublines] = useState([]);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterLine, setSelectedFilterLine] = useState('');

  // Modal states - Create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [lineId, setLineId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Activo');

  // Modal states - Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubline, setSelectedSubline] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLineId, setEditLineId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Activo');

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLines = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/lines`);
      const resData = await response.json();
      if (resData.success) {
        setLines(resData.data);
      }
    } catch (error) {
      console.error('Error fetching lines:', error);
    }
  };

  const fetchSublines = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let url = `${apiBaseUrl}/sublines`;
      if (selectedFilterLine) {
        url += `?lineId=${selectedFilterLine}`;
      }
      const response = await fetch(url);
      const resData = await response.json();
      if (resData.success) {
        setSublines(resData.data);
      } else {
        setErrorMsg(resData.message || 'Error al cargar las sublíneas.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
  }, []);

  useEffect(() => {
    fetchSublines();
  }, [selectedFilterLine]);

  const handleCreateSubline = async (e) => {
    e.preventDefault();
    if (!lineId) {
      setErrorMsg('Por favor selecciona una línea.');
      return;
    }

    const selectedLineObj = lines.find(l => l.id === parseInt(lineId));
    if (!selectedLineObj) {
      setErrorMsg('La línea seleccionada no es válida.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/sublines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          line_id: parseInt(lineId), 
          name, 
          description,
          status 
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccessMsg('Sublínea creada con éxito.');
        setName('');
        setDescription('');
        setLineId('');
        setStatus('Activo');
        fetchSublines();
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(resData.message || 'Error al crear la sublínea.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (subline) => {
    setSelectedSubline(subline);
    setEditName(subline.name);
    setEditLineId(subline.line_id);
    setEditDescription(subline.description || '');
    setEditStatus(subline.status || 'Activo');
    setShowEditModal(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleUpdateSubline = async (e) => {
    e.preventDefault();
    if (!editLineId) {
      setErrorMsg('Por favor selecciona una línea.');
      return;
    }

    const selectedLineObj = lines.find(l => l.id === parseInt(editLineId));
    if (!selectedLineObj) {
      setErrorMsg('La línea seleccionada no es válida.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/sublines/${selectedSubline.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          line_id: parseInt(editLineId),
          name: editName, 
          description: editDescription, 
          status: editStatus 
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccessMsg('Sublínea actualizada con éxito.');
        fetchSublines();
        setTimeout(() => {
          setShowEditModal(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(resData.message || 'Error al actualizar la sublínea.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (subline) => {
    setErrorMsg('');
    const newStatus = subline.status === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const response = await fetch(`${apiBaseUrl}/sublines/${subline.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        fetchSublines();
      } else {
        setErrorMsg(resData.message || 'Error al cambiar el estado de la sublínea.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error de conexión. No se pudo cambiar el estado.');
    }
  };

  const filteredSublines = sublines.filter(subline => {
    const parentLine = lines.find(l => l.id === subline.line_id);
    const categoryName = parentLine ? parentLine.category_name : (subline.category_name || '');
    return (
      subline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subline.line_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subline.description && subline.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div className="search-bar-container">
        <div>
          <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>Sublíneas de Repuestos</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Administra las sublíneas de repuestos asociadas a líneas.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            className="form-input"
            style={{ width: '200px', paddingLeft: '1rem', background: '#0b0f19', color: '#f3f4f6' }}
            value={selectedFilterLine}
            onChange={(e) => setSelectedFilterLine(e.target.value)}
          >
            <option value="">Todas las Líneas</option>
            {lines.map(line => (
              <option key={line.id} value={line.id}>{line.name} ({line.category_name})</option>
            ))}
          </select>

          <div className="input-container" style={{ minWidth: '220px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar sublínea..."
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
            <Plus size={18} /> Nueva Sublínea
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
      ) : filteredSublines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '16px', marginTop: '1rem' }}>
          No se encontraron sublíneas.
        </div>
      ) : (
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                
                <th>Sublínea</th>
                <th>Línea</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Creador</th>
                <th>Fecha de Creación</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSublines.map((subline) => (
                <tr key={subline.id}>
                  
                  <td style={{ fontWeight: 600, color: '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers size={16} style={{ color: 'var(--accent)' }} />
                      {subline.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.02)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      {subline.line_name}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.02)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      {lines.find(l => l.id === subline.line_id)?.category_name || subline.category_name || 'N/A'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={subline.description}>
                    {subline.description || 'Sin descripción'}
                  </td>
                  <td>
                    <span className={`badge ${subline.status === 'Activo' ? 'badge-approved' : 'badge-error'}`}>
                      {subline.status || 'Activo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <User size={14} /> {subline.creator_name || subline.creator_email || 'Sistema'}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <Calendar size={14} className="text-muted" /> 
                      {subline.created_at ? new Date(subline.created_at).toISOString().split('T')[0] : 'N/A'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => openEditModal(subline)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(subline)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: subline.status === 'Inactivo' ? '#10b981' : '#ef4444', cursor: 'pointer' }}
                      >
                        {subline.status === 'Inactivo' ? 'Activar' : 'Desactivar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Nueva Sublínea</h3>
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

            <form onSubmit={handleCreateSubline}>
              <div className="form-group">
                <label className="form-label" htmlFor="subline-line">Línea Padre</label>
                <div className="input-container">
                  <select 
                    id="subline-line"
                    className="form-input" 
                    style={{ paddingLeft: '2.5rem', background: '#0b0f19', color: '#f3f4f6' }}
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    disabled={actionLoading}
                    required
                  >
                    <option value="">Selecciona una línea...</option>
                    {lines.map(line => (
                      <option key={line.id} value={line.id}>{line.name} ({line.category_name})</option>
                    ))}
                  </select>
                  <Tag className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="subline-name">Nombre de la Sublínea</label>
                <div className="input-container">
                  <input 
                    id="subline-name"
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Delantera, Trasera, Kit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <Layers className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="subline-desc">Descripción</label>
                <div className="input-container">
                  <textarea 
                    id="subline-desc"
                    className="form-input" 
                    placeholder="Descripción de la sublínea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={actionLoading}
                    style={{ minHeight: '100px', resize: 'vertical', padding: '0.75rem 0.75rem 0.75rem 2.5rem' }}
                  />
                  <FileText className="input-icon" style={{ top: '1.2rem' }} size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="subline-status">Estado</label>
                <div className="input-container">
                  <select 
                    id="subline-status"
                    className="form-input" 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={actionLoading}
                    style={{ paddingLeft: '2.5rem', background: '#0b0f19', color: '#f3f4f6' }}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                  <Tag className="input-icon" size={16} />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '1.5rem', width: '100%' }} 
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="spinner" size={18} /> : 'Crear Sublínea'}
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
              <h3 className="modal-title">Editar Sublínea</h3>
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

            <form onSubmit={handleUpdateSubline}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-subline-line">Línea Padre</label>
                <div className="input-container">
                  <select 
                    id="edit-subline-line"
                    className="form-input" 
                    style={{ paddingLeft: '2.5rem', background: '#0b0f19', color: '#f3f4f6' }}
                    value={editLineId}
                    onChange={(e) => setEditLineId(e.target.value)}
                    disabled={actionLoading}
                    required
                  >
                    <option value="">Selecciona una línea...</option>
                    {lines.map(line => (
                      <option key={line.id} value={line.id}>{line.name} ({line.category_name})</option>
                    ))}
                  </select>
                  <Tag className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-subline-name">Nombre de la Sublínea</label>
                <div className="input-container">
                  <input 
                    id="edit-subline-name"
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Delantera, Trasera, Kit"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <Layers className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="edit-subline-desc">Descripción</label>
                <div className="input-container">
                  <textarea 
                    id="edit-subline-desc"
                    className="form-input" 
                    placeholder="Descripción de la sublínea"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    disabled={actionLoading}
                    style={{ minHeight: '100px', resize: 'vertical', padding: '0.75rem 0.75rem 0.75rem 2.5rem' }}
                  />
                  <FileText className="input-icon" style={{ top: '1.2rem' }} size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="edit-subline-status">Estado</label>
                <div className="input-container">
                  <select 
                    id="edit-subline-status"
                    className="form-input" 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={actionLoading}
                    style={{ paddingLeft: '2.5rem', background: '#0b0f19', color: '#f3f4f6' }}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                  <Tag className="input-icon" size={16} />
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
