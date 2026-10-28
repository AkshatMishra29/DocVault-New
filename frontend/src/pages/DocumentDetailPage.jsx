import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Tag, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Copy,
  RefreshCw,
  Star
} from 'lucide-react';
import './DocumentDetailPage.css';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [assetsList, setAssetsList] = useState([]);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const [docRes, assetsRes] = await Promise.all([
          fetch(`http://localhost:5001/api/documents/${id}`),
          fetch('http://localhost:5001/api/assets')
        ]);
        const docData = await docRes.json();
        const assetsData = await assetsRes.json();
        if (docData.success) {
          setDoc(docData.data);
        }
        if (assetsData.success) {
          setAssetsList(assetsData.data);
        }
      } catch (err) {
        console.error('Failed to load document details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const handleCopy = (key, val) => {
    navigator.clipboard?.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document from your vault?')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/documents/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        navigate('/documents');
      }
    } catch (err) {
      alert('Error deleting document: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="doc-detail-page" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw size={32} className="spin-icon" color="var(--primary)" />
        <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Decrypting document data...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="doc-detail-page">
        <button className="back-btn" onClick={() => navigate('/documents')}>
          <ArrowLeft size={20} />
          <span>Back to Documents</span>
        </button>
        <p style={{ marginTop: '20px' }}>Document not found.</p>
      </div>
    );
  }

  return (
    <div className="doc-detail-page">
      {/* Detail Top Navigation */}
      <div className="detail-header-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="detail-action-icons">
          <button 
            className={`detail-icon-btn ${doc.isFavorite ? 'active-fav' : ''}`}
            title={doc.isFavorite ? "Remove Star" : "Star Document"}
            onClick={async () => {
              const updatedFav = !doc.isFavorite;
              setDoc({ ...doc, isFavorite: updatedFav });
              try {
                await fetch(`http://localhost:5001/api/documents/${id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ isFavorite: updatedFav })
                });
              } catch (e) {
                console.error(e);
              }
            }}
          >
            <Star size={18} color={doc.isFavorite ? "#F59E0B" : "currentColor"} fill={doc.isFavorite ? "#F59E0B" : "none"} />
          </button>

          <button 
            className="detail-icon-btn" 
            title="Share Document"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: doc.title, url: doc.downloadUrl });
              } else {
                navigator.clipboard?.writeText(doc.downloadUrl);
                alert('Secure download link copied to clipboard!');
              }
            }}
          >
            <Share2 size={18} />
          </button>

          <button 
            className="detail-icon-btn" 
            title="Download Document"
            onClick={() => {
              if (doc.downloadUrl) window.open(doc.downloadUrl, '_blank');
            }}
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Main Document Title & Status */}
      <div className="detail-title-card">
        <span className="badge badge-primary">{doc.category || 'Other'}</span>
        <h2 className="detail-main-title">{doc.title}</h2>
        <div className="detail-sec-pill">
          <ShieldCheck size={14} color="#10B981" />
          <span>Verified Firebase Storage Hash</span>
        </div>
      </div>

      {/* AI Smart Summary Card */}
      <div className="detail-ai-summary-card">
        <div className="summary-card-header">
          <div className="ai-label">
            <Sparkles size={16} color="#4338CA" />
            <span>AI Executive Summary</span>
          </div>
          <span className="ai-confidence-tag">Groq Llama-3.3</span>
        </div>
        <p className="summary-content">{doc.summary || 'Summary indexed and analyzed.'}</p>
        <button 
          className="ask-this-doc-btn"
          onClick={() => navigate(`/ask-ai?docId=${doc.id || doc._id}`)}
        >
          <Sparkles size={14} />
          <span>Ask AI about this specific document</span>
        </button>
      </div>

      {/* Extracted Key-Value Entity Fields */}
      {doc.keyDetails && Object.keys(doc.keyDetails).length > 0 && (
        <div className="detail-fields-section">
          <h3 className="section-subheading">Key Extracted Details</h3>
          <div className="entity-list">
            {Object.entries(doc.keyDetails).map(([key, val]) => (
              <div key={key} className="entity-row">
                <div className="entity-info">
                  <span className="entity-label">{key}</span>
                  <span className="entity-value">{val}</span>
                </div>
                <button 
                  className="copy-field-btn" 
                  onClick={() => handleCopy(key, val)}
                  title="Copy Value"
                >
                  {copiedKey === key ? (
                    <CheckCircle2 size={16} color="#10B981" />
                  ) : (
                    <Copy size={16} color="var(--text-muted)" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags and Metadata */}
      {doc.tags && doc.tags.length > 0 && (
        <div className="tags-section">
          <h3 className="section-subheading">Tags</h3>
          <div className="tags-wrap">
            {doc.tags.map(t => (
              <span key={t} className="doc-tag-pill">
                <Tag size={12} />
                <span>{t}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Link to Household & Vehicle Asset */}
      <div className="detail-asset-link-card">
        <div className="asset-link-header">
          <div className="asset-link-title">
            <span style={{ fontSize: '1.1rem' }}>🚗</span>
            <span>Link to Family Asset</span>
          </div>
          {doc.assetId && (
            <span className="badge badge-success">Linked</span>
          )}
        </div>
        <div className="asset-link-body">
          <select 
            className="custom-select"
            value={doc.assetId || ''}
            onChange={async (e) => {
              const selectedAssetId = e.target.value;
              const updatedDoc = { ...doc, assetId: selectedAssetId || null };
              setDoc(updatedDoc);
              try {
                await fetch(`http://localhost:5001/api/documents/${id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ assetId: selectedAssetId || null })
                });
              } catch (err) {
                console.error('Error linking asset:', err);
              }
            }}
          >
            <option value="">-- No Asset Linked --</option>
            {assetsList.map(a => (
              <option key={a.id || a._id} value={a.id || a._id}>
                {a.name} ({a.category})
              </option>
            ))}
          </select>
          <p className="asset-link-hint">
            Tag this document to a tracked vehicle or appliance to automatically surface insurance & warranty terms.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="detail-bottom-actions">
        {doc.downloadUrl && (
          <button 
            className="btn-secondary" 
            onClick={() => window.open(doc.downloadUrl, '_blank')}
          >
            <ExternalLink size={16} />
            <span>View Original File</span>
          </button>
        )}
        <button className="btn-danger-outline" onClick={handleDelete}>
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
