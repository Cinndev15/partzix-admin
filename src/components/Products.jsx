import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle, Package, Eye, Trash2, Tag, X } from 'lucide-react';

export default function Products({ authToken, apiBaseUrl }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lines, setLines] = useState([]);
  const [sublines, setSublines] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedSubline, setSelectedSubline] = useState('');

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchWarehouses = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/warehouses`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const resData = await response.json();
      if (resData.success) {
        setWarehouses(resData.data);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

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
    if (!selectedCategory) {
      setLines([]);
      setSublines([]);
      setSelectedLine('');
      setSelectedSubline('');
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}/lines?categoryId=${selectedCategory}`);
      const resData = await response.json();
      if (resData.success) {
        setLines(resData.data);
      }
    } catch (error) {
      console.error('Error fetching lines:', error);
    }
  };

  const fetchSublines = async () => {
    if (!selectedLine) {
      setSublines([]);
      setSelectedSubline('');
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}/sublines?lineId=${selectedLine}`);
      const resData = await response.json();
      if (resData.success) {
        setSublines(resData.data);
      }
    } catch (error) {
      console.error('Error fetching sublines:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let params = [];
      if (selectedWarehouse) params.push(`warehouseId=${selectedWarehouse}`);
      if (selectedCategory) params.push(`categoryId=${selectedCategory}`);
      if (selectedLine) params.push(`lineId=${selectedLine}`);
      if (selectedSubline) params.push(`sublineId=${selectedSubline}`);
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);

      const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
      const response = await fetch(`${apiBaseUrl}/products${queryStr}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const resData = await response.json();
      if (resData.success) {
        setProducts(resData.data || []);
      } else {
        setErrorMsg(resData.message || 'Error al cargar los productos.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchLines();
  }, [selectedCategory]);

  useEffect(() => {
    fetchSublines();
  }, [selectedLine]);

  useEffect(() => {
    fetchProducts();
  }, [selectedWarehouse, selectedCategory, selectedLine, selectedSubline, searchQuery]);

  const viewProductDetails = async (productId) => {
    setLoadingDetail(true);
    setDetailProduct(null);
    setShowDetailModal(true);
    try {
      const response = await fetch(`${apiBaseUrl}/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const resData = await response.json();
      if (resData.success) {
        setDetailProduct(resData.data);
      } else {
        alert(resData.message || 'Error al obtener detalles del producto.');
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error(error);
      alert('Error al conectar con el servidor.');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este producto del catálogo?')) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setSuccessMsg('Producto eliminado con éxito.');
        fetchProducts();
        if (showDetailModal && detailProduct?.id === id) {
          setShowDetailModal(false);
        }
        setTimeout(() => setSuccessMsg(''), 2000);
      } else {
        alert(resData.message || 'Error al eliminar el producto.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión.');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>Catálogo General de Productos</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Visualiza, busca y supervisa todos los repuestos y productos subidos por los almacenes afiliados.</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Almacén</label>
          <select className="form-input" style={{ fontSize: '0.8rem', height: '38px', padding: '0.25rem 0.5rem' }} value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
            <option value="">Todos los Almacenes</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Categoría</label>
          <select className="form-input" style={{ fontSize: '0.8rem', height: '38px', padding: '0.25rem 0.5rem' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Todas las Categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Línea</label>
          <select className="form-input" style={{ fontSize: '0.8rem', height: '38px', padding: '0.25rem 0.5rem' }} value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)} disabled={!selectedCategory}>
            <option value="">Todas las Líneas</option>
            {lines.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Sublínea</label>
          <select className="form-input" style={{ fontSize: '0.8rem', height: '38px', padding: '0.25rem 0.5rem' }} value={selectedSubline} onChange={(e) => setSelectedSubline(e.target.value)} disabled={!selectedLine}>
            <option value="">Todas las Sublíneas</option>
            {sublines.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Buscar por palabra clave</label>
          <div className="input-container">
            <input 
              type="text" 
              className="form-input" 
              style={{ fontSize: '0.8rem', height: '38px', paddingLeft: '2rem' }}
              placeholder="SKU, Código, Nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="input-icon" size={14} style={{ left: '0.75rem' }} />
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ margin: '1rem 0' }}>
          <CheckCircle className="alert-icon" size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error" style={{ margin: '1rem 0' }}>
          <AlertCircle className="alert-icon" size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="spinner" size={32} />
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
          No se encontraron productos con los criterios seleccionados.
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Consecutivo</th>
                <th>Imagen</th>
                <th>Nombre Comercial</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Precio Venta</th>
                <th>Almacén</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const salePrice = parseFloat(p.sale_price) || 0;
                const mainImg = p.images && p.images.find(img => img.is_main);
                const thumbUrl = mainImg ? `${apiBaseUrl.replace('/api', '')}/${mainImg.image_path}` : null;

                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{p.consecutive_code}</td>
                    <td>
                      <div style={{ width: '42px', height: '42px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                        {thumbUrl ? (
                          <img src={thumbUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package size={18} style={{ color: 'var(--text-secondary)' }} />
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#111827', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.commercial_name}>
                      {p.commercial_name}
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>{p.sku}</code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.stock_units} uds</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      ${salePrice.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.warehouse_name}</td>
                    <td>
                      <span className={`status-badge ${p.status === 'Activo (Visible en tienda)' ? 'approved' : p.status === 'Borrador' ? 'pending' : 'rejected'}`} style={{ fontSize: '0.75rem' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button onClick={() => viewProductDetails(p.id)} className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={12} /> Detalle
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '750px', width: '90%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Detalle del Producto</h3>
              <button onClick={() => setShowDetailModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="spinner" size={32} />
              </div>
            ) : detailProduct ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {/* Header Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>{detailProduct.consecutive_code}</span>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>{detailProduct.commercial_name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SKU: <strong style={{ color: '#111827' }}>{detailProduct.sku}</strong> | Fábrica Ref: <strong style={{ color: '#111827' }}>{detailProduct.factory_reference || 'N/A'}</strong></p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className={`status-badge ${detailProduct.status === 'Activo (Visible en tienda)' ? 'approved' : detailProduct.status === 'Borrador' ? 'pending' : 'rejected'}`}>
                      {detailProduct.status}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Almacén: <strong>{detailProduct.warehouse_name}</strong></span>
                  </div>
                </div>

                {/* Photo Gallery */}
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Tag size={16} /> Galería de Fotos</h5>
                  {detailProduct.images && detailProduct.images.length > 0 ? (
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {detailProduct.images.map(img => (
                        <div key={img.id} style={{ flexShrink: 0, width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                          <img src={`${apiBaseUrl.replace('/api', '')}/${img.image_path}`} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {img.is_main && (
                            <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--accent)', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 600 }}>Principal</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: 'var(--text-secondary)', border: '1px dashed var(--border)' }}>
                      Sin imágenes para este producto.
                    </div>
                  )}
                </div>

                {/* Info sections */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {/* Categorization & Prices */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem' }}>Clasificación & Precios</h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <div>Categoría: <strong>{detailProduct.category_name}</strong></div>
                      <div>Línea: <strong>{detailProduct.line_name || 'N/A'}</strong></div>
                      <div>Sublínea: <strong>{detailProduct.subline_name || 'N/A'}</strong></div>
                      <div>Marca Repuesto: <strong>{detailProduct.product_brand_name || 'N/A'}</strong></div>
                      <div style={{ marginTop: '0.5rem', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>
                        Precio de Venta Base: <strong>${parseFloat(detailProduct.sale_price || 0).toLocaleString('es-CO')}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility & Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem' }}>Especificaciones del Repuesto</h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <div>Tipo de Repuesto: <strong>{detailProduct.spare_part_type}</strong></div>
                      {detailProduct.mechanical_position && <div>Posición Mecánica: <strong>{detailProduct.mechanical_position}</strong></div>}
                      {detailProduct.vehicle_side && <div>Lado del Vehículo: <strong>{detailProduct.vehicle_side}</strong></div>}
                      {detailProduct.compatible_transmission_type && <div>Transmisión: <strong>{detailProduct.compatible_transmission_type}</strong></div>}
                      <div>Stock Disponible: <strong>{detailProduct.stock_units} unidades</strong></div>
                    </div>
                  </div>
                </div>

                {/* Compatibility relationships */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem' }}>Compatibilidad de Vehículos</h5>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Modelos Compatibles: </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                        {detailProduct.compatible_models && detailProduct.compatible_models.length > 0 ? (
                          detailProduct.compatible_models.map(m => (
                            <span key={m.id} style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{m.name}</span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Todos</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Años Compatibles: </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                        {detailProduct.compatible_years && detailProduct.compatible_years.length > 0 ? (
                          detailProduct.compatible_years.map(y => (
                            <span key={y.id} style={{ background: '#fef3c7', color: '#b45309', padding: '0.15rem 0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{y.year}</span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Todos</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Cilindrajes Compatibles: </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                        {detailProduct.compatible_displacements && detailProduct.compatible_displacements.length > 0 ? (
                          detailProduct.compatible_displacements.map(d => (
                            <span key={d.id} style={{ background: '#f3e8ff', color: '#6b21a8', padding: '0.15rem 0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{d.displacement}</span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Todos</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Taxes & Description */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Impuestos Aplicados</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {detailProduct.applicable_taxes && detailProduct.applicable_taxes.length > 0 ? (
                        detailProduct.applicable_taxes.map(t => (
                          <span key={t.id} style={{ background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{t.name} ({t.rate_percent}%)</span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Exento / Ninguno</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ficha Técnica / Descripción</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      {detailProduct.technical_description || 'Sin ficha técnica registrada.'}
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button onClick={() => handleDeleteProduct(detailProduct.id)} className="btn-secondary" style={{ color: '#dc2626', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Trash2 size={16} /> Eliminar de la Plataforma
                  </button>
                  <button onClick={() => setShowDetailModal(false)} className="btn-primary" style={{ width: 'auto' }}>
                    Cerrar Detalle
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No se cargaron los detalles.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
