import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Loader2, AlertCircle, CheckCircle, GitFork, Tag, Calendar, User, FileText, Edit2 } from 'lucide-react';

export default function Lines({ authToken, apiBaseUrl }) {
  const [lines, setLines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('');

  // Modal states - Create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Activo');

  // Modal states - Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Activo');

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/categories`);
      const resData = await response.json();
      if (resData.success) {
        setCategories(resData.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLines = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let url = `${apiBaseUrl}/lines`;
      if (selectedFilterCategory) {
        url += `?categoryId=${selectedFilterCategory}`;
      }
      const response = await fetch(url);
      const resData = await response.json();
      if (resData.success) {
        setLines(resData.data);
      } else {
        setErrorMsg(resData.message || 'Error al cargar las líneas.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchLines();
  }, [selectedFilterCategory]);

  const handleCreateLine = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      setErrorMsg('Por favor selecciona una categoría.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/lines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          category_id: parseInt(categoryId), 
          name, 
          description,
          status 
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccessMsg('Línea creada con éxito.');
        setName('');
        setDescription('');
        setCategoryId('');
        setStatus('Activo');
        fetchLines();
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(resData.message || 'Error al crear la línea.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (line) => {
    setSelectedLine(line);
    setEditName(line.name);
    setEditCategoryId(line.category_id);
    setEditDescription(line.description || '');
    setEditStatus(line.status || 'Activo');
    setShowEditModal(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleUpdateLine = async (e) => {
    e.preventDefault();
    if (!editCategoryId) {
      setErrorMsg('Por favor selecciona una categoría.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/lines/${selectedLine.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          category_id: parseInt(editCategoryId),
          name: editName, 
          description: editDescription, 
          status: editStatus 
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccessMsg('Línea actualizada con éxito.');
        fetchLines();
        setTimeout(() => {
          setShowEditModal(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(resData.message || 'Error al actualizar la línea.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (line) => {
    setErrorMsg('');
    const newStatus = line.status === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const response = await fetch(`${apiBaseUrl}/lines/${line.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        fetchLines();
      } else {
        setErrorMsg(resData.message || 'Error al cambiar el estado de la línea.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error de conexión. No se pudo cambiar el estado.');
    }
  };

  const filteredLines = lines.filter(line => 
    line.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    line.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (line.description && line.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div className="search-bar-container">
        <div>
          <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>Líneas de Repuestos</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Administra las líneas de repuestos asociadas a categorías.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            className="form-input"
            style={{ width: '200px', paddingLeft: '1rem', background: '#0b0f19', color: '#f3f4f6' }}
            value={selectedFilterCategory}
            onChange={(e) => setSelectedFilterCategory(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <div className="input-container" style={{ minWidth: '220px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar línea..."
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
            <Plus size={18} /> Nueva Línea
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
      ) : filteredLines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '16px', marginTop: '1rem' }}>
          No se encontraron líneas.
        </div>
      ) : (
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                
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
              {filteredLines.map((line) => (
                <tr key={line.id}>
                  
                  <td style={{ fontWeight: 600, color: '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <GitFork size={16} style={{ color: 'var(--accent)' }} />
                      {line.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.02)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      {line.category_name}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={line.description}>
                    {line.description || 'Sin descripción'}
                  </td>
                  <td>
                    <span className={`badge ${line.status === 'Activo' ? 'badge-approved' : 'badge-error'}`}>
                      {line.status || 'Activo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <User size={14} /> {line.creator_name || line.creator_email || 'Sistema'}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <Calendar size={14} className="text-muted" /> 
                      {line.created_at ? new Date(line.created_at).toISOString().split('T')[0] : 'N/A'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => openEditModal(line)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(line)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: line.status === 'Inactivo' ? '#10b981' : '#ef4444', cursor: 'pointer' }}
                      >
                        {line.status === 'Inactivo' ? 'Activar' : 'Desactivar'}
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
              <h3 className="modal-title">Nueva Línea</h3>
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

            <form onSubmit={handleCreateLine}>
              <div className="form-group">
                <label className="form-label" htmlFor="line-category">Categoría Padre</label>
                <div className="input-container">
                  <select 
                    id="line-category"
                    className="form-input" 
                    style={{ paddingLeft: '2.5rem', background: '#0b0f19', color: '#f3f4f6' }}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={actionLoading}
                    required
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <Tag className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="line-name">Nombre de la Línea</label>
                <div className="input-container">
                  <input 
                    id="line-name"
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Suspensión, Frenos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <GitFork className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="line-desc">Descripción</label>
                <div className="input-container">
                  <textarea 
                    id="line-desc"
                    className="form-input" 
                    placeholder="Descripción de la línea de repuestos"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={actionLoading}
                    style={{ minHeight: '100px', resize: 'vertical', padding: '0.75rem 0.75rem 0.75rem 2.5rem' }}
                  />
                  <FileText className="input-icon" style={{ top: '1.2rem' }} size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="line-status">Estado</label>
                <div className="input-container">
                  <select 
                    id="line-status"
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
                {actionLoading ? <Loader2 className="spinner" size={18} /> : 'Crear Línea'}
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
              <h3 className="modal-title">Editar Línea</h3>
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

            <form onSubmit={handleUpdateLine}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-line-category">Categoría Padre</label>
                <div className="input-container">
                  <select 
                    id="edit-line-category"
                    className="form-input" 
                    style={{ paddingLeft: '2.5rem', background: '#0b0f19', color: '#f3f4f6' }}
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    disabled={actionLoading}
                    required
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <Tag className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="edit-line-name">Nombre de la Línea</label>
                <div className="input-container">
                  <input 
                    id="edit-line-name"
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Suspensión, Frenos"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <GitFork className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="edit-line-desc">Descripción</label>
                <div className="input-container">
                  <textarea 
                    id="edit-line-desc"
                    className="form-input" 
                    placeholder="Descripción de la línea de repuestos"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    disabled={actionLoading}
                    style={{ minHeight: '100px', resize: 'vertical', padding: '0.75rem 0.75rem 0.75rem 2.5rem' }}
                  />
                  <FileText className="input-icon" style={{ top: '1.2rem' }} size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="edit-line-status">Estado</label>
                <div className="input-container">
                  <select 
                    id="edit-line-status"
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
