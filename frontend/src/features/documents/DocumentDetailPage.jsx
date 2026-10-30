import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiRequest, API_BASE_URL } from "../../services/api";
import { 
  ArrowLeft, Download, Trash2, Calendar, FileText, CheckCircle2,
  ShieldCheck, AlertTriangle, ExternalLink, Link2, Sparkles
} from "lucide-react";

import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import Modal from "../../components/common/Modal/Modal";
import "./DocumentDetailPage.css";

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [linking, setLinking] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDocAndAssets() {
      try {
        setLoading(true);
        const [docRes, assetsRes] = await Promise.all([
          apiRequest(`/api/documents/${id}`),
          apiRequest("/api/assets"),
        ]);

        if (docRes.success && docRes.data) {
          setDoc(docRes.data);
        } else {
          setError("Document not found in vault.");
        }

        if (assetsRes.success && assetsRes.data) {
          setAssets(assetsRes.data);
        }
      } catch (err) {
        setError("Failed to retrieve document details.");
      } finally {
        setLoading(false);
      }
    }
    loadDocAndAssets();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await apiRequest(`/api/documents/${id}`, { method: "DELETE" });
      if (res.success) {
        navigate("/documents");
      } else {
        alert(res.error || "Failed to delete document.");
      }
    } catch (err) {
      alert("Error deleting document.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLinkAsset = async () => {
    if (!selectedAssetId) return;
    try {
      setLinking(true);
      const res = await apiRequest(`/api/documents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ assetId: selectedAssetId }),
      });
      if (res.success && res.data) {
        setDoc(res.data);
      }
    } catch (err) {
      console.warn("Link asset failed:", err.message);
    } finally {
      setLinking(false);
    }
  };

  const token = localStorage.getItem("token");
  const downloadUrl = `${API_BASE_URL}/api/documents/${id}/download?token=${token}`;

  return (
    <div className="dv-doc-detail-page">
      <AppHeader
        title={doc ? doc.title : "Document Inspection"}
        subtitle="Verified metadata, structured key-value entities, and direct download stream."
      />

      <div className="dv-doc-detail-content">
        <div className="dv-detail-top-nav">
          <Link to="/documents" className="dv-back-btn">
            <ArrowLeft size={16} /> Back to Repository
          </Link>

          {doc && (
            <div className="dv-detail-actions">
              <Link to={`/ask-ai?docId=${doc._id}`}>
                <Button variant="secondary" size="sm" icon={Sparkles}>
                  Ask Copilot About This Doc
                </Button>
              </Link>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm" icon={Download}>
                  Download Original
                </Button>
              </a>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="dv-docs-loading">
            <div className="dv-btn__spinner" />
            <span>Decrypting document metadata...</span>
          </div>
        ) : error || !doc ? (
          <Card padding="lg">
            <p className="dv-text-danger">{error || "Document not found."}</p>
          </Card>
        ) : (
          <div className="dv-detail-grid">
            {/* Left Column: Metadata & Extracted Key Details */}
            <div className="dv-detail-col">
              <Card padding="lg" className="dv-detail-summary-card">
                <div className="dv-detail-card-header">
                  <Badge variant="primary" size="md">{doc.category}</Badge>
                  <span className="dv-text-muted">{doc.format} • {doc.fileSizeFormatted}</span>
                </div>

                <h2 className="dv-detail-heading">{doc.title}</h2>
                <p className="dv-detail-summary-text">{doc.summary || "No automated summary generated."}</p>

                {doc.expiryDate && (
                  <div className="dv-detail-expiry-box">
                    <Calendar size={18} color="#D97706" />
                    <div>
                      <strong>Renewal Expiry Date: {doc.expiryDate}</strong>
                      <p>Tracked in your active deadlines calendar.</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Extracted Key Details Map */}
              <Card padding="lg" className="dv-detail-entities-card">
                <h3 className="dv-entities-title">Structured Entity Fields (Extracted by AI)</h3>
                <p className="dv-entities-sub">Parsed automatically from OCR text and multimodal analysis.</p>

                {doc.keyDetails && Object.keys(doc.keyDetails).length > 0 ? (
                  <div className="dv-entity-table">
                    {Object.entries(doc.keyDetails).map(([key, val]) => (
                      <div key={key} className="dv-entity-row">
                        <span className="dv-entity-key">{key.replace(/_/g, " ")}</span>
                        <span className="dv-entity-val">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="dv-text-muted">No specific keyDetails detected in this document.</p>
                )}
              </Card>
            </div>

            {/* Right Column: Asset Linkage & File Verification */}
            <div className="dv-detail-col">
              <Card padding="lg" className="dv-detail-sidebar-card">
                <h3 className="dv-sidebar-section-title">Link to Household or Vehicle Asset</h3>
                <p className="dv-sidebar-section-desc">Associate this policy or invoice with an asset in your registry.</p>

                <div className="dv-link-asset-box">
                  <select
                    className="dv-select-control"
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                  >
                    <option value="">Select an Asset...</option>
                    {assets.map((a) => (
                      <option key={a._id} value={a._id}>{a.name} ({a.category})</option>
                    ))}
                  </select>

                  <Button
                    variant="secondary"
                    size="md"
                    icon={Link2}
                    loading={linking}
                    disabled={!selectedAssetId}
                    onClick={handleLinkAsset}
                  >
                    Link Asset
                  </Button>
                </div>
              </Card>

              <Card padding="lg" className="dv-detail-sidebar-card">
                <h3 className="dv-sidebar-section-title">Storage & Security Audit</h3>
                <ul className="dv-detail-audit-list">
                  <li>
                    <ShieldCheck size={16} color="#059669" />
                    <span>Database-backed binary file storage</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} color="#2563EB" />
                    <span>Tenant ID bound strictly to your account</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} color="#2563EB" />
                    <span>Hugging Face dense vector embedded</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Document"
      >
        <p className="dv-confirm-text">
          Are you sure you want to permanently delete <strong>{doc?.title}</strong>? All associated deadline reminders and vector embeddings will also be removed.
        </p>
        <div className="dv-confirm-actions">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Yes, Permanently Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
