import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Wind, 
  Laptop, 
  Plus, 
  ChevronRight, 
  ShieldCheck, 
  FileText,
  Trash2,
  X,
  RefreshCw,
  Home
} from 'lucide-react';
import './AssetsPage.css';

export default function AssetsPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: 'Vehicle',
    estimatedValue: '',
    status: 'Active',
    warrantyExpiry: '',
    insuranceExpiry: '',
    nextService: '',
    icon: 'Car'
  });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/assets');
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setAssetForm({
          name: '',
          category: 'Vehicle',
          estimatedValue: '',
          status: 'Active',
          warrantyExpiry: '',
          insuranceExpiry: '',
          nextService: '',
          icon: 'Car'
        });
        fetchAssets();
      }
    } catch (err) {
      alert('Error creating asset: ' + err.message);
    }
  };

  const handleDeleteAsset = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this tracked asset?')) return;
    try {
      await fetch(`http://localhost:5001/api/assets/${id}`, { method: 'DELETE' });
      fetchAssets();
    } catch (err) {
      console.error(err);
    }
  };

  const getAssetIcon = (iconName) => {
    switch (iconName) {
      case 'Car':
        return <Car size={24} color="#4338CA" />;
      case 'Wind':
        return <Wind size={24} color="#06B6D4" />;
      case 'Laptop':
        return <Laptop size={24} color="#10B981" />;
      case 'Home':
        return <Home size={24} color="#F59E0B" />;
      default:
        return <FileText size={24} color="#4338CA" />;
    }
  };

  return (
    <div className="assets-page">
      {/* Header Banner */}
      <div className="assets-banner">
        <div className="assets-banner-text">
          <h2>Household & Vehicle Assets</h2>
          <p>Link invoices, warranties, and insurance policies to each family asset.</p>
        </div>
        <button className="add-asset-pill" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>New Asset</span>
        </button>
      </div>

      {/* Assets Grid / Cards */}
      <div className="asset-stack">
        {loading ? (
          <div className="empty-state">
            <RefreshCw size={28} className="spin-icon" color="var(--primary)" />
            <p>Loading family assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="empty-state">
            <Car size={48} color="var(--border-color)" />
            <h3>No assets tracked yet</h3>
            <p>Add your car, air conditioner, phone, or home appliances to link warranties and policies.</p>
            <button className="btn-primary" style={{ marginTop: '12px' }} onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              <span>Add First Asset</span>
            </button>
          </div>
        ) : (
          assets.map((asset) => (
            <div key={asset.id || asset._id} className="asset-card">
              <div className="asset-top">
                <div className="asset-icon-box">
                  {getAssetIcon(asset.icon)}
                </div>
                <div className="asset-header-meta">
                  <span className="badge badge-muted">{asset.category}</span>
                  <h3 className="asset-title">{asset.name}</h3>
                  {asset.estimatedValue && (
                    <span className="asset-val">Est. Value: {asset.estimatedValue}</span>
                  )}
                </div>
                <button 
                  className="delete-asset-btn"
                  onClick={(e) => handleDeleteAsset(asset.id || asset._id, e)}
                  title="Delete Asset"
                >
                  <Trash2 size={16} color="var(--danger)" />
                </button>
              </div>

              <div className="asset-details-list">
                <div className="asset-status-pill">
                  <ShieldCheck size={14} color="#10B981" />
                  <span>{asset.status || 'Active Asset'}</span>
                </div>

                {asset.insuranceExpiry && (
                  <div className="asset-info-row">
                    <span className="info-key">Insurance Expiry</span>
                    <span className="info-val text-warning">{asset.insuranceExpiry}</span>
                  </div>
                )}

                {asset.warrantyExpiry && (
                  <div className="asset-info-row">
                    <span className="info-key">Warranty Valid Till</span>
                    <span className="info-val text-success">{asset.warrantyExpiry}</span>
                  </div>
                )}

                {asset.nextService && (
                  <div className="asset-info-row">
                    <span className="info-key">Upcoming Service</span>
                    <span className="info-val">{asset.nextService}</span>
                  </div>
                )}
              </div>

              <div className="asset-footer">
                <div className="linked-docs-tag">
                  <FileText size={14} />
                  <span>Linked Vault Documents</span>
                </div>
                <button 
                  className="view-asset-btn"
                  onClick={() => navigate(`/documents?q=${encodeURIComponent(asset.name.split(' ')[0])}`)}
                >
                  <span>Filter Docs</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add New Asset */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Track New Asset</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="asset-modal-form">
              <div className="form-group">
                <label className="input-label">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Honda City ZX / Daikin Split AC"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="input-label">Category</label>
                  <select
                    className="custom-select"
                    value={assetForm.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      let icon = 'FileText';
                      if (cat === 'Vehicle') icon = 'Car';
                      else if (cat === 'Home Appliances') icon = 'Wind';
                      else if (cat === 'Electronics') icon = 'Laptop';
                      else if (cat === 'Real Estate') icon = 'Home';
                      setAssetForm({ ...assetForm, category: cat, icon });
                    }}
                  >
                    <option value="Vehicle">Vehicle</option>
                    <option value="Home Appliances">Home Appliances</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Real Estate">Real Estate / Property</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="input-label">Estimated Value</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹ 9,50,000"
                    value={assetForm.estimatedValue}
                    onChange={(e) => setAssetForm({ ...assetForm, estimatedValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="input-label">Insurance Expiry</label>
                  <input
                    type="date"
                    value={assetForm.insuranceExpiry}
                    onChange={(e) => setAssetForm({ ...assetForm, insuranceExpiry: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Warranty Expiry</label>
                  <input
                    type="date"
                    value={assetForm.warrantyExpiry}
                    onChange={(e) => setAssetForm({ ...assetForm, warrantyExpiry: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Next Service Note / Date</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-11-15 (40,000 km Service)"
                  value={assetForm.nextService}
                  onChange={(e) => setAssetForm({ ...assetForm, nextService: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Save Asset to Vault
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
