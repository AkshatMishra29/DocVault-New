import { API_BASE_URL } from '../../services/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Upload, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('docvault_token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    // Fetch live documents
    fetch(`${API_BASE_URL}/api/documents`, { headers: authHeaders })
      .then(res => res.json())
      .then(data => {
        if (data.success) setDocuments(data.data);
      })
      .catch(err => console.error(err));

    // Fetch live deadlines
    fetch(`${API_BASE_URL}/api/deadlines`, { headers: authHeaders })
      .then(res => res.json())
      .then(data => {
        if (data.success) setDeadlines(data.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/documents?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const displayName = user?.name || 'Vault User';

  return (
    <div className="home-page">
      {/* Welcome & Storage Overview Banner */}
      <section className="welcome-banner">
        <div className="welcome-user">
          <span className="user-greeting">Namaste,</span>
          <h2 className="user-name">{displayName}</h2>
        </div>
        <div className="security-status-badge">
          <ShieldCheck size={14} color="#10B981" />
          <span>Encrypted Vault Active</span>
        </div>
      </section>

      {/* Instant Search Bar */}
      <section className="search-section">
        <form className="search-box" onSubmit={handleSearchSubmit}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search policies, invoices, Aadhaar, RC..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </section>

      {/* Urgent Expiry / Action Alert */}
      {deadlines.length > 0 && (
        <section className="urgent-card" onClick={() => navigate('/deadlines')}>
          <div className="urgent-badge">
            <AlertCircle size={15} color="#EF4444" />
            <span>Action Required</span>
          </div>
          <div className="urgent-content">
            <h4 className="urgent-title">{deadlines[0].title}</h4>
            <p className="urgent-desc">Expires on {deadlines[0].date} ({deadlines[0].daysLeft} days remaining)</p>
          </div>
          <div className="urgent-action">
            <span>Renew</span>
            <ChevronRight size={16} />
          </div>
        </section>
      )}

      {/* Quick Action Matrix */}
      <section className="quick-matrix">
        <div className="matrix-btn" onClick={() => navigate('/upload')}>
          <div className="matrix-icon bg-indigo">
            <Upload size={20} color="#4338CA" />
          </div>
          <span className="matrix-label">Upload Doc</span>
        </div>

        <div className="matrix-btn" onClick={() => navigate('/ask-ai')}>
          <div className="matrix-icon bg-cyan">
            <Sparkles size={20} color="#06B6D4" />
          </div>
          <span className="matrix-label">Ask Vault AI</span>
        </div>

        <div className="matrix-btn" onClick={() => navigate('/deadlines')}>
          <div className="matrix-icon bg-amber">
            <Clock size={20} color="#F59E0B" />
          </div>
          <span className="matrix-label">Renewals</span>
        </div>

        <div className="matrix-btn" onClick={() => navigate('/assets')}>
          <div className="matrix-icon bg-emerald">
            <FileText size={20} color="#10B981" />
          </div>
          <span className="matrix-label">Track Assets</span>
        </div>
      </section>

      {/* Ask AI Smart Prompt Box */}
      <section className="ai-teaser-card" onClick={() => navigate('/ask-ai')}>
        <div className="ai-teaser-header">
          <div className="ai-teaser-pill">
            <Sparkles size={14} color="#4338CA" />
            <span>DocVault Intelligence</span>
          </div>
          <ArrowUpRight size={16} color="var(--text-muted)" />
        </div>
        <p className="ai-teaser-text">
          "What is the claim process for my insurance policy or warranty coverage?"
        </p>
        <span className="ai-teaser-cta">Ask question from your documents →</span>
      </section>

      {/* Category Breakdown Matrix */}
      <section className="section-block">
        <div className="section-header">
          <h3 className="section-title">Vault Categories</h3>
          <span className="section-link">{documents.length} Total Docs</span>
        </div>

        <div className="categories-grid-home">
          {[
            { name: 'Insurance', icon: '🛡️', color: '#4338CA' },
            { name: 'Identity', icon: '🪪', color: '#F59E0B' },
            { name: 'Medical', icon: '🏥', color: '#EF4444' },
            { name: 'Property', icon: '🏠', color: '#10B981' },
            { name: 'Appliances', icon: '🔌', color: '#06B6D4' },
            { name: 'Other', icon: '📁', color: '#6B7280' },
          ].map((cat) => {
            const count = documents.filter(d => (d.category || '').toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <div 
                key={cat.name} 
                className="category-card-home"
                onClick={() => navigate(`/documents?category=${cat.name}`)}
              >
                <div className="category-card-top">
                  <span className="cat-emoji">{cat.icon}</span>
                  <span className="cat-count-pill">{count}</span>
                </div>
                <span className="cat-name">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent / Starred Documents */}
      <section className="section-block">
        <div className="section-header">
          <h3 className="section-title">Recent Documents</h3>
          <button className="section-link" onClick={() => navigate('/documents')}>
            View All ({documents.length})
          </button>
        </div>

        <div className="document-list">
          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No documents in vault yet. Tap "Upload Doc" above to add your first document.
            </div>
          ) : (
            documents.slice(0, 4).map((doc) => (
              <div 
                key={doc.id || doc._id} 
                className="doc-card"
                onClick={() => navigate(`/documents/${doc.id || doc._id}`)}
              >
                <div className="doc-icon-wrap">
                  <FileText size={20} color="var(--primary)" />
                </div>
                <div className="doc-info">
                  <h4 className="doc-title">{doc.title}</h4>
                  <div className="doc-meta">
                    <span className="badge badge-muted">{doc.category || 'Other'}</span>
                    {doc.fileSizeFormatted && (
                      <>
                        <span className="doc-dot">•</span>
                        <span>{doc.fileSizeFormatted}</span>
                      </>
                    )}
                    {doc.expiryDate && (
                      <>
                        <span className="doc-dot">•</span>
                        <span className="badge badge-warning">Exp: {doc.expiryDate}</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
