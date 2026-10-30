import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { 
  FileText, Search, Plus, Star, Filter, ArrowUpDown, Calendar,
  Download, Eye, AlertCircle
} from "lucide-react";

import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import Input from "../../components/common/Input/Input";
import EmptyState from "../../components/common/EmptyState/EmptyState";

import "./DocumentsPage.css";

const CATEGORIES = ["All", "Insurance", "Identity", "Appliances", "Property", "Medical", "Other"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "All";
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, searchQuery]);

  async function fetchDocuments() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "All") params.append("category", selectedCategory);
      if (searchQuery) params.append("q", searchQuery);

      const endpoint = `/api/documents${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await apiRequest(endpoint);

      if (res.success && res.data) {
        setDocuments(res.data);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      setError("Failed to fetch documents. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  const handleCategorySelect = (cat) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "All") next.delete("category");
    else next.set("category", cat);
    setSearchParams(next);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (val) next.set("q", val);
    else next.delete("q");
    setSearchParams(next);
  };

  return (
    <div className="dv-docs-page">
      <AppHeader
        title="Document Repository"
        subtitle="Manage, search, and inspect your structured personal policies and proofs."
      />

      <div className="dv-docs-content">
        {/* Top Controls: Search Bar & Upload CTA */}
        <div className="dv-docs-toolbar">
          <div className="dv-docs-search">
            <Input
              type="text"
              icon={Search}
              placeholder="Search by title, policy clauses, or tags..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <Link to="/upload">
            <Button variant="primary" size="md" icon={Plus}>
              Upload Document
            </Button>
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="dv-category-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`dv-cat-pill ${selectedCategory === cat ? "dv-cat-pill--active" : ""}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {error && (
          <div className="dv-docs-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Documents Grid */}
        {loading ? (
          <div className="dv-docs-loading">
            <div className="dv-btn__spinner" />
            <span>Loading your vault documents...</span>
          </div>
        ) : documents.length === 0 ? (
          searchQuery || selectedCategory !== "All" ? (
            <EmptyState
              
              title="No documents matched your filter"
              description={`No documents found matching "${searchQuery || selectedCategory}". Try adjusting your keywords or clearing the filter.`}
              actionLabel="Clear Filters"
              onAction={() => setSearchParams({})}
            />
          ) : (
            <EmptyState
              
              title="Your document repository is empty"
              description="Upload your vehicle insurance, health policies, passport copies, or appliance invoices to start tracking."
              actionLabel="Upload First Document"
              onAction={() => window.location.href = "/upload"}
            />
          )
        ) : (
          <div className="dv-docs-grid">
            {documents.map((doc) => (
              <Card key={doc._id} hover padding="md" className="dv-doc-card">
                <div className="dv-doc-card__header">
                  <Badge variant="primary" size="sm">{doc.category || "General"}</Badge>
                  <span className="dv-doc-card__format">{doc.format || "PDF"}</span>
                </div>

                <div className="dv-doc-card__body">
                  <h3 className="dv-doc-card__title">
                    <Link to={`/documents/${doc._id}`}>{doc.title}</Link>
                  </h3>
                  <p className="dv-doc-card__summary">
                    {doc.summary || "Metadata extracted via Groq LPU multimodal analysis."}
                  </p>
                </div>

                {doc.expiryDate && (
                  <div className="dv-doc-card__expiry">
                    <Calendar size={13} />
                    <span>Expires: <strong>{doc.expiryDate}</strong></span>
                  </div>
                )}

                <div className="dv-doc-card__footer">
                  <span className="dv-doc-card__filesize">{doc.fileSizeFormatted || "Stored"}</span>
                  <div className="dv-doc-card__actions">
                    <Link to={`/documents/${doc._id}`}>
                      <Button variant="ghost" size="sm">Inspect</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
