import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Loader2, AlertCircle, CheckCircle, Percent, FileText, Edit2, Trash2 } from 'lucide-react';

export default function Taxes({ authToken, apiBaseUrl }) {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedTax, setSelectedTax] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [ratePercent, setRatePercent] = useState('');
  const [description, setDescription] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTaxes = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`${apiBaseUrl}/taxes`);
      const resData = await response.json();
      if (resData.success) {
        setTaxes(resData.data);
      } else {
        setErrorMsg(resData.message || 'Error al cargar los impuestos.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedTax(null);
    setName('');
    setRatePercent('');
    setDescription('');
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const openEditModal = (tax) => {
    setModalMode('edit');
    setSelectedTax(tax);
    setName(tax.name);
    setRatePercent(tax.rate_percent);
    setDescription(tax.description || '');
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setErrorMsg('El nombre es requerido.');
      return;
    }
    const rate = parseFloat(ratePercent);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setErrorMsg('La tasa debe ser un número entre 0 y 100.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const url = modalMode === 'create' 
        ? `${apiBaseUrl}/taxes` 
        : `${apiBaseUrl}/taxes/${selectedTax.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name,
          rate_percent: rate,
          description
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccessMsg(modalMode === 'create' ? 'Impuesto creado con éxito.' : 'Impuesto actualizado con éxito.');
        fetchTaxes();
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        setErrorMsg(resData.message || 'Error al guardar el impuesto.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTax = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este impuesto? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/taxes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        fetchTaxes();
      } else {
        setErrorMsg(resData.message || 'Error al eliminar el impuesto.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error al conectar con el servidor.');
      setLoading(false);
    }
  };

  const filteredTaxes = taxes.filter(tax =>
    tax.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tax.description && tax.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div className="search-bar-container">
        <div>
          <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>Configuración de Impuestos</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Administra las tasas impositivas aplicables a los productos y repuestos en el sistema.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="input-container" style={{ minWidth: '280px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar impuesto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="input-icon" size={18} />
          </div>
          <button 
            onClick={openCreateModal} 
            className="btn-primary" 
            style={{ width: 'auto', display: 'inline-flex', padding: '0.85rem 1.25rem', cursor: 'pointer' }}
          >
            <Plus size={18} /> Nuevo Impuesto
          </button>
        </div>
      </div>

      {errorMsg && !showModal && (
        <div className="alert alert-error" style={{ margin: '1rem 0' }}>
          <AlertCircle className="alert-icon" size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="spinner" size={32} />
        </div>
      ) : filteredTaxes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '16px', marginTop: '1rem' }}>
          No se encontraron impuestos registrados.
        </div>
      ) : (
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Impuesto</th>
                <th>Tasa (%)</th>
                <th>Descripción</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTaxes.map((tax) => (
                <tr key={tax.id}>
                  <td style={{ fontWeight: 700, color: '#111827' }}>
                    {tax.name}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: 'var(--accent)' }}>
                      <Percent size={14} />
                      {tax.rate_percent}%
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tax.description}>
                    {tax.description || 'Sin descripción'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => openEditModal(tax)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteTax(tax.id)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{modalMode === 'create' ? 'Crear Nuevo Impuesto' : 'Editar Impuesto'}</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
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

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="tax-name">Nombre del Impuesto</label>
                <div className="input-container">
                  <input 
                    id="tax-name"
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. IVA 19%"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <Percent className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="tax-rate">Tasa Porcentual (%)</label>
                <div className="input-container">
                  <input 
                    id="tax-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="form-input" 
                    placeholder="Ej. 19.00"
                    value={ratePercent}
                    onChange={(e) => setRatePercent(e.target.value)}
                    disabled={actionLoading}
                    required
                  />
                  <Percent className="input-icon" size={16} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="tax-desc">Descripción</label>
                <div className="input-container">
                  <textarea 
                    id="tax-desc"
                    className="form-input" 
                    placeholder="Descripción detallada del impuesto..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={actionLoading}
                    style={{ minHeight: '80px', resize: 'vertical', padding: '0.75rem 0.75rem 0.75rem 2.5rem' }}
                  />
                  <FileText className="input-icon" style={{ top: '1.2rem' }} size={16} />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ marginTop: '1.5rem', width: '100%' }} 
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="spinner" size={18} /> : (modalMode === 'create' ? 'Crear Impuesto' : 'Actualizar Impuesto')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
