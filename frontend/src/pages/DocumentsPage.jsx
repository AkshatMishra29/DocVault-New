import { API_BASE_URL } from "../config.js";
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Star, 
  Clock, 
  ChevronRight,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import './DocumentsPage.css';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Insurance', 'Appliances', 'Identity', 'Property', 'Medical', 'Other'];

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/documents`;
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (query) params.append('q', query);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, query]);

  const sortedDocs = [...documents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="documents-page">
      {/* Search Header */}
      <div className="doc-search-bar">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search your real uploaded documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="clear-btn" onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      {/* Horizontal Category Chips */}
      <div className="category-scroll">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats & Quick Filter Row */}
      <div className="docs-meta-row">
        <span className="docs-count">
          Showing <strong>{sortedDocs.length}</strong> {sortedDocs.length === 1 ? 'document' : 'documents'}
        </span>
        <button 
          className="sort-trigger" 
          onClick={() => setSortBy(sortBy === 'recent' ? 'name' : 'recent')}
        >
          <ArrowUpDown size={14} />
          <span>{sortBy === 'recent' ? 'Most Recent' : 'Name (A-Z)'}</span>
        </button>
      </div>

      {/* Document Items List */}
      <div className="doc-items-stack">
        {loading ? (
          <div className="empty-state">
            <RefreshCw size={28} className="spin-icon" color="var(--primary)" />
            <p>Loading documents from your vault...</p>
          </div>
        ) : sortedDocs.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} color="var(--border-color)" />
            <h3>No documents in this view</h3>
            <p>Upload a PDF policy, invoice, or ID to start building your vault.</p>
            <button className="btn-primary" style={{ marginTop: '12px' }} onClick={() => navigate('/upload')}>
              Upload Document
            </button>
          </div>
        ) : (
          sortedDocs.map((doc) => (
            <div 
              key={doc.id || doc._id} 
              className="doc-list-item"
              onClick={() => navigate(`/documents/${doc.id || doc._id}`)}
            >
              <div className="item-icon-box">
                <FileText size={22} color="var(--primary)" />
              </div>
              
              <div className="item-details">
                <div className="item-top-line">
                  <h4 className="item-title">{doc.title}</h4>
                  {doc.isFavorite && <Star size={14} color="#F59E0B" fill="#F59E0B" />}
                </div>

                {doc.summary && (
                  <p className="item-summary-snippet">
                    {doc.summary.slice(0, 80)}...
                  </p>
                )}

                <div className="item-badges">
                  <span className="badge badge-primary">{doc.category || 'Other'}</span>
                  <span className="item-format">{doc.format || 'PDF'}</span>
                  {doc.fileSizeFormatted && (
                    <span className="item-format">• {doc.fileSizeFormatted}</span>
                  )}
                  {doc.expiryDate && (
                    <span className="badge badge-warning">
                      <Clock size={11} />
                      <span>Expires {doc.expiryDate}</span>
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight size={18} color="var(--text-muted)" className="item-arrow" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
