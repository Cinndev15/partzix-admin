import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Loader2, AlertCircle, CheckCircle, CheckCircle2, Car, Tag, Calendar, User, FileText, Edit2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Upload, Download, FileSpreadsheet, AlertTriangle, Trash2 } from 'lucide-react';

export default function Models({ authToken, apiBaseUrl }) {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterBrand, setSelectedFilterBrand] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Modal states - Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  // Download example template
  const handleDownloadTemplate = async (format = 'xlsx') => {
    try {
      setDownloadingFormat(format);
      setImportError('');
      const response = await fetch(`${apiBaseUrl}/models/import/template?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Error al descargar la plantilla.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plantilla_modelos.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      setImportError('Error al descargar la plantilla de ejemplo. Asegúrate de tener conexión con el servidor.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    if (!isValid) {
      setImportError('Formato no válido. Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv).');
      setImportFile(null);
      return;
    }
    setImportFile(file);
    setImportError('');
    setImportSuccess('');
    setImportResult(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      setImportError('Por favor selecciona o arrastra un archivo para importar.');
      return;
    }

    setImportLoading(true);
    setImportError('');
    setImportSuccess('');
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const response = await fetch(`${apiBaseUrl}/models/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setImportSuccess(resData.message || 'Importación completada con éxito.');
        setImportResult(resData.data);
        setImportFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchModels();
      } else {
        setImportError(resData.message || 'Error al procesar la importación del archivo.');
        if (resData.data) {
          setImportResult(resData.data);
        }
      }
    } catch (err) {
      console.error(err);
      setImportError('Error de comunicación con el servidor al intentar importar.');
    } finally {
      setImportLoading(false);
    }
  };

  const resetImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportError('');
    setImportSuccess('');
    setImportResult(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (model.description && model.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Reset to first page when search or brand filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilterBrand]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredModels.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentModels = filteredModels.slice(indexOfFirstItem, indexOfLastItem);

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
          <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>Modelos de Vehículos</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Administra los modelos asociados a las marcas de vehículos.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-input"
            style={{ width: '190px', paddingLeft: '1rem', background: '#0b0f19', color: '#f3f4f6' }}
            value={selectedFilterBrand}
            onChange={(e) => setSelectedFilterBrand(e.target.value)}
          >
            <option value="">Todas las Marcas</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>

          <div className="input-container" style={{ minWidth: '200px' }}>
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
            onClick={() => setShowImportModal(true)} 
            className="btn-secondary" 
            style={{ 
              width: 'auto', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.85rem 1.15rem', 
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: '12px',
              fontWeight: 600
            }}
            title="Importar modelos desde archivo Excel o CSV"
          >
            <Upload size={18} style={{ color: 'var(--accent)' }} /> Importar
          </button>

          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn-primary" 
            style={{ width: 'auto', display: 'inline-flex', padding: '0.85rem 1.25rem', cursor: 'pointer' }}
          >
            <Plus size={18} /> Nuevo Modelo
          </button>
        </div>
      </div>

      {errorMsg && !showCreateModal && !showEditModal && !showImportModal && (
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
              {currentModels.map((model) => (
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

          {/* Pagination */}
          <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Mostrando <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{filteredModels.length === 0 ? 0 : indexOfFirstItem + 1}</span> a <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{Math.min(indexOfLastItem, filteredModels.length)}</span> de <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{filteredModels.length}</span> modelos
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

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ 
                  background: 'rgba(255, 85, 0, 0.1)', 
                  padding: '0.5rem', 
                  borderRadius: '10px', 
                  color: 'var(--accent)' 
                }}>
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: '1.25rem' }}>Importar Modelos</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Carga masiva desde hojas Excel (.xlsx, .xls) o CSV (.csv)
                  </p>
                </div>
              </div>
              <button 
                onClick={resetImportModal}
                className="modal-close-btn"
                disabled={importLoading}
              >
                <X size={18} />
              </button>
            </div>

            {importError && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle className="alert-icon" size={18} />
                <span style={{ fontSize: '0.85rem' }}>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                <CheckCircle className="alert-icon" size={18} />
                <span style={{ fontSize: '0.85rem' }}>{importSuccess}</span>
              </div>
            )}

            {/* Step 1: Download Templates */}
            <div style={{ 
              background: '#0b0f19', 
              border: '1px solid var(--border)', 
              borderRadius: '14px', 
              padding: '1.1rem', 
              marginBottom: '1.25rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Download size={15} style={{ color: 'var(--accent)' }} /> 1. Descarga la plantilla de ejemplo
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Formatos soportados</span>
              </div>
              
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: '1.4' }}>
                Descarga el archivo preformateado con las columnas requeridas (<strong>Categoría</strong>, <strong>Marca</strong>, <strong>Modelo</strong>, <strong>Descripción</strong>, <strong>Estado</strong>) y datos de ejemplo:
              </p>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('xlsx')}
                  disabled={downloadingFormat !== null}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Descargar plantilla en formato Microsoft Excel"
                >
                  {downloadingFormat === 'xlsx' ? (
                    <Loader2 className="spinner" size={15} />
                  ) : (
                    <FileSpreadsheet size={16} />
                  )}
                  Plantilla Excel (.xlsx)
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('csv')}
                  disabled={downloadingFormat !== null}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Descargar plantilla en formato CSV"
                >
                  {downloadingFormat === 'csv' ? (
                    <Loader2 className="spinner" size={15} />
                  ) : (
                    <FileText size={16} />
                  )}
                  Plantilla CSV (.csv)
                </button>
              </div>
            </div>

            {/* Step 2: Upload File Area */}
            <form onSubmit={handleImportSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <Upload size={15} style={{ color: 'var(--accent)' }} /> 2. Carga tu archivo diligenciado
                </label>

                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    border: isDragging 
                      ? '2px dashed var(--accent)' 
                      : importFile 
                        ? '2px solid rgba(16, 185, 129, 0.5)' 
                        : '2px dashed var(--border)',
                    borderRadius: '14px',
                    background: isDragging 
                      ? 'rgba(255, 85, 0, 0.08)' 
                      : importFile 
                        ? 'rgba(16, 185, 129, 0.05)' 
                        : '#0b0f19',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        validateAndSetFile(e.target.files[0]);
                      }
                    }}
                    disabled={importLoading}
                  />

                  {importFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                        <div style={{ 
                          background: 'rgba(16, 185, 129, 0.2)', 
                          color: '#10b981', 
                          padding: '0.6rem', 
                          borderRadius: '10px' 
                        }}>
                          <FileSpreadsheet size={24} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
                            {importFile.name}
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {(importFile.size / 1024).toFixed(1)} KB • Listo para importar
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImportFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          color: '#ef4444',
                          padding: '0.4rem',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        title="Quitar archivo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        margin: '0 auto 0.6rem auto', 
                        borderRadius: '50%', 
                        background: 'rgba(255, 85, 0, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--accent)'
                      }}>
                        <Upload size={20} />
                      </div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        Haz clic aquí o arrastra tu archivo Excel o CSV
                      </p>
                      <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Archivos admitidos: .xlsx, .xls, .csv (máximo 15MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Import Results Box */}
              {importResult && (
                <div style={{
                  background: '#0b0f19',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                    Resumen del procesamiento:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.4rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{importResult.total_rows || 0}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Filas Leídas</div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.6rem 0.4rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{importResult.imported || 0}</div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981' }}>Nuevos Modelos</div>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.6rem 0.4rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{importResult.skipped || 0}</div>
                      <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Omitidos/Dupl.</div>
                    </div>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div style={{ marginTop: '0.75rem', maxHeight: '110px', overflowY: 'auto' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={13} /> Observaciones en {importResult.errors.length} filas:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                        {importResult.errors.map((errItem, idx) => (
                          <li key={idx} style={{ marginBottom: '0.15rem' }}>
                            Fila {errItem.row}: {errItem.reason || errItem.message || 'Error en registro'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={resetImportModal}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.8rem', cursor: 'pointer' }}
                  disabled={importLoading}
                >
                  {importResult ? 'Cerrar' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}
                  disabled={importLoading || !importFile}
                >
                  {importLoading ? (
                    <>
                      <Loader2 className="spinner" size={18} /> Procesando Archivo...
                    </>
                  ) : (
                    <>
                      <Upload size={18} /> Importar Modelos
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
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

