import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Loader2, AlertCircle, CheckCircle, Car, Tag, Calendar, User, FileText, Edit2 } from 'lucide-react';

export default function Models({ authToken, apiBaseUrl }) {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterBrand, setSelectedFilterBrand] = useState('');

  // Modal states - Create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Activo');

  // Modal states - Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBrandId, setEditBrandId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Activo');

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/brands`);
      const resData = await response.json();
      if (resData.success) {
        setBrands(resData.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let url = `${apiBaseUrl}/models`;
      if (selectedFilterBrand) {
        url += `?brandId=${selectedFilterBrand}`;
      }
      const response = await fetch(url);
      const resData = await response.json();
      if (resData.success) {
        setModels(resData.data);
      } else {
        setErrorMsg(resData.message || 'Error al cargar los modelos.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchModels();
  }, [selectedFilterBrand]);

  const handleCreateModel = async (e) => {
    e.preventDefault();
    if (!brandId) {
      setErrorMsg('Por favor selecciona una marca.');
      return;
    }

    const selectedBrandObj = brands.find(b => b.id === parseInt(brandId));
    if (!selectedBrandObj) {
      setErrorMsg('La marca seleccionada no es válida.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          category_id: selectedBrandObj.category_id,
          brand_id: parseInt(brandId), 
          name, 
          description,
          status 
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccessMsg('Modelo creado con éxito.');
        setName('');
        setDescription('');
        setBrandId('');
        setStatus('Activo');
        fetchModels();
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(resData.message || 'Error al crear el modelo.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (model) => {
    setSelectedModel(model);
    setEditName(model.name);
    setEditBrandId(model.brand_id);
    setEditDescription(model.description || '');
    setEditStatus(model.status || 'Activo');
    setShowEditModal(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleUpdateModel = async (e) => {
    e.preventDefault();
    if (!editBrandId) {
      setErrorMsg('Por favor selecciona una marca.');
      return;
    }

    const selectedBrandObj = brands.find(b => b.id === parseInt(editBrandId));
    if (!selectedBrandObj) {
      setErrorMsg('La marca seleccionada no es válida.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/models/${selectedModel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          category_id: selectedBrandObj.category_id,
          brand_id: parseInt(editBrandId),
          name: editName, 
          description: editDescription, 
          status: editStatus 
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccessMsg('Modelo actualizado con éxito.');
        fetchModels();
        setTimeout(() => {
          setShowEditModal(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(resData.message || 'Error al actualizar el modelo.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (model) => {
    setErrorMsg('');
    const newStatus = model.status === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const response = await fetch(`${apiBaseUrl}/models/${model.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        fetchModels();
      } else {
        setErrorMsg(resData.message || 'Error al cambiar el estado del modelo.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error de conexión. No se pudo cambiar el estado.');
    }
  };

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (model.description && model.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div className="search-bar-container">
        <div>
          <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>Modelos de Vehículos</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Administra los modelos asociados a las marcas de vehículos.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            className="form-input"
            style={{ width: '200px', paddingLeft: '1rem', background: '#0b0f19', color: '#f3f4f6' }}
            value={selectedFilterBrand}
            onChange={(e) => setSelectedFilterBrand(e.target.value)}
          >
            <option value="">Todas las Marcas</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>

          <div className="input-container" style={{ minWidth: '220px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar modelo..."
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
            <Plus size={18} /> Nuevo Modelo
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
      ) : filteredModels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '16px', marginTop: '1rem' }}>
          No se encontraron modelos.
        </div>
      ) : (
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                
                <th>Modelo</th>
                <th>Marca</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Creador</th>
                <th>Fecha de Creación</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((model) => (
                <tr key={model.id}>
                  
                  <td style={{ fontWeight: 600, color: '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Car size={16} style={{ color: 'var(--accent)' }} />
                      {model.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.02)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      {model.brand_name}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.02)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      {model.category_name}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={model.description}>
                    {model.description || 'Sin descripción'}
                  </td>
                  <td>
                    <span className={`badge ${model.status === 'Activo' ? 'badge-approved' : 'badge-error'}`}>
                      {model.status || 'Activo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <User size={14} /> {model.creator_name || model.creator_email || 'Sistema'}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <Calendar size={14} className="text-muted" /> 
                      {model.created_at ? new Date(model.created_at).toISOString().split('T')[0] : 'N/A'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => openEditModal(model)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(model)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: model.status === 'Inactivo' ? '#10b981' : '#ef4444', cursor: 'pointer' }}
                      >
                        {model.status === 'Inactivo' ? 'Activar' : 'Desactivar'}
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
              <h3 className="modal-title">Nuevo Modelo</h3>
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

            <form onSubmit={handleCreateModel}>
              <div className="form-group">
                <label className="form-label" htmlFor="model-brand">Marca Asociada</label>
                <div className="input-container">
                  <select 
                    id="model-brand"
                    className="form-input" 
                    style={{ paddingLeft: '2.5rem', background: '#0b0f19', color: '#f3f4f6' }}
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    disabled={actionLoading}
                    required
                  >
                    <option value="">Selecciona una marca...</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name} ({brand.category_name})</option>
                    ))}
                  </select>
                  <Tag className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="model-name">Nombre del Modelo</label>
                <div className="input-container">
                  <input 
                    id="model-name"
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Corolla, Spark, Civic"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <Car className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="model-desc">Descripción</label>
                <div className="input-container">
                  <textarea 
                    id="model-desc"
                    className="form-input" 
                    placeholder="Descripción del modelo"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={actionLoading}
                    style={{ minHeight: '100px', resize: 'vertical', padding: '0.75rem 0.75rem 0.75rem 2.5rem' }}
                  />
                  <FileText className="input-icon" style={{ top: '1.2rem' }} size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="model-status">Estado</label>
                <div className="input-container">
                  <select 
                    id="model-status"
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
                {actionLoading ? <Loader2 className="spinner" size={18} /> : 'Crear Modelo'}
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
              <h3 className="modal-title">Editar Modelo</h3>
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

            <form onSubmit={handleUpdateModel}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-model-brand">Marca Asociada</label>
                <div className="input-container">
                  <select 
                    id="edit-model-brand"
                    className="form-input" 
                    style={{ paddingLeft: '2.5rem', background: '#0b0f19', color: '#f3f4f6' }}
                    value={editBrandId}
                    onChange={(e) => setEditBrandId(e.target.value)}
                    disabled={actionLoading}
                    required
                  >
                    <option value="">Selecciona una marca...</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name} ({brand.category_name})</option>
                    ))}
                  </select>
                  <Tag className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-model-name">Nombre del Modelo</label>
                <div className="input-container">
                  <input 
                    id="edit-model-name"
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Corolla, Spark, Civic"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <Car className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="edit-model-desc">Descripción</label>
                <div className="input-container">
                  <textarea 
                    id="edit-model-desc"
                    className="form-input" 
                    placeholder="Descripción del modelo"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    disabled={actionLoading}
                    style={{ minHeight: '100px', resize: 'vertical', padding: '0.75rem 0.75rem 0.75rem 2.5rem' }}
                  />
                  <FileText className="input-icon" style={{ top: '1.2rem' }} size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="edit-model-status">Estado</label>
                <div className="input-container">
                  <select 
                    id="edit-model-status"
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
