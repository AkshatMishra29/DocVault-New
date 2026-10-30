import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";
import { apiRequest } from "../../services/api";
import { 
  FileText, UploadCloud, Calendar, Sparkles, Layers, ArrowRight,
  ShieldCheck, AlertTriangle, Clock, ChevronRight
} from "lucide-react";

import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import emptyDocsImg from "../../assets/illustrations/empty-documents.svg";

import "./HomePage.css";

export default function HomePage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [docsRes, deadRes, assetsRes] = await Promise.all([
          apiRequest("/api/documents"),
          apiRequest("/api/deadlines"),
          apiRequest("/api/assets"),
        ]);

        if (docsRes.data) setDocuments(docsRes.data);
        if (deadRes.data) setDeadlines(deadRes.data);
        if (assetsRes.data) setAssets(assetsRes.data);
      } catch (err) {
        console.warn("[Dashboard] Error loading data:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const urgentDeadlines = deadlines.filter((d) => d.severity === "urgent" || (d.daysLeft && d.daysLeft <= 15));
  const recentDocs = documents.slice(0, 4);

  return (
    <div className="dv-dashboard">
      <AppHeader
        title={`Good morning, ${user?.name ? user.name.split(" ")[0] : "Vault Custodian"}`}
        subtitle="Here is your personal document repository and active policy status."
      />

      <div className="dv-dashboard__content">
        {/* Urgent Renewal Alert Banner */}
        {urgentDeadlines.length > 0 && (
          <div className="dv-alert-banner">
            <div className="dv-alert-banner__icon-box">
              <AlertTriangle size={20} color="#DC2626" />
            </div>
            <div className="dv-alert-banner__text">
              <h4>Renewal Attention Required</h4>
              <p>You have {urgentDeadlines.length} critical policy deadline(s) expiring within 15 days.</p>
            </div>
            <Link to="/deadlines">
              <Button variant="danger" size="sm">Review Deadlines</Button>
            </Link>
          </div>
        )}

        {/* Core Vault Metrics */}
        <div className="dv-stats-grid">
          <Card padding="md" className="dv-stat-card">
            <div className="dv-stat-card__icon-box dv-stat-card__icon-box--blue">
              <FileText size={20} color="#2563EB" />
            </div>
            <div className="dv-stat-card__meta">
              <span className="dv-stat-card__label">Total Documents</span>
              <span className="dv-stat-card__val">{loading ? "..." : documents.length}</span>
            </div>
          </Card>

          <Card padding="md" className="dv-stat-card">
            <div className="dv-stat-card__icon-box dv-stat-card__icon-box--amber">
              <Calendar size={20} color="#D97706" />
            </div>
            <div className="dv-stat-card__meta">
              <span className="dv-stat-card__label">Active Deadlines</span>
              <span className="dv-stat-card__val">{loading ? "..." : deadlines.length}</span>
            </div>
          </Card>

          <Card padding="md" className="dv-stat-card">
            <div className="dv-stat-card__icon-box dv-stat-card__icon-box--emerald">
              <Layers size={20} color="#059669" />
            </div>
            <div className="dv-stat-card__meta">
              <span className="dv-stat-card__label">Tracked Assets</span>
              <span className="dv-stat-card__val">{loading ? "..." : assets.length}</span>
            </div>
          </Card>

          <Card padding="md" className="dv-stat-card">
            <div className="dv-stat-card__icon-box dv-stat-card__icon-box--purple">
              <Sparkles size={20} color="#7C3AED" />
            </div>
            <div className="dv-stat-card__meta">
              <span className="dv-stat-card__label">AI Assistant</span>
              <Link to="/ask-ai" className="dv-stat-card__link">
                Ask Copilot <ArrowRight size={14} />
              </Link>
            </div>
          </Card>
        </div>

        {/* Dual Layout: Recent Documents & Upcoming Deadlines */}
        <div className="dv-dash-dual-grid">
          {/* Left: Recent Documents */}
          <div className="dv-dash-pane">
            <div className="dv-dash-pane__header">
              <h2 className="dv-dash-pane__title">Recent Vault Documents</h2>
              <Link to="/documents" className="dv-dash-pane__action">
                View All <ChevronRight size={16} />
              </Link>
            </div>

            {loading ? (
              <Card padding="lg"><p className="dv-text-muted">Loading vault documents...</p></Card>
            ) : recentDocs.length === 0 ? (
              <EmptyState
                illustration={emptyDocsImg}
                title="Your vault is currently empty"
                description="Upload your insurance policies, warranty cards, or identity proofs to enable automated OCR extraction."
                actionLabel="Upload First Document"
                onAction={() => window.location.href = "/upload"}
              />
            ) : (
              <div className="dv-doc-list">
                {recentDocs.map((doc) => (
                  <Card key={doc._id} hover padding="sm" className="dv-doc-row">
                    <Link to={`/documents/${doc._id}`} className="dv-doc-row__link">
                      <div className="dv-doc-row__icon-box">
                        <FileText size={18} color="#2563EB" />
                      </div>
                      <div className="dv-doc-row__info">
                        <h4 className="dv-doc-row__title">{doc.title}</h4>
                        <span className="dv-doc-row__sub">
                          {doc.category} • {doc.format || "PDF"} • {doc.fileSizeFormatted || "Stored"}
                        </span>
                      </div>
                      {doc.expiryDate && (
                        <Badge variant={doc.isExpiringSoon ? "danger" : "default"} size="sm">
                          Exp: {doc.expiryDate}
                        </Badge>
                      )}
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right: Upcoming Deadlines */}
          <div className="dv-dash-pane">
            <div className="dv-dash-pane__header">
              <h2 className="dv-dash-pane__title">Upcoming Deadlines</h2>
              <Link to="/deadlines" className="dv-dash-pane__action">
                Calendar <ChevronRight size={16} />
              </Link>
            </div>

            {loading ? (
              <Card padding="lg"><p className="dv-text-muted">Loading renewal schedules...</p></Card>
            ) : deadlines.length === 0 ? (
              <Card padding="lg" className="dv-empty-dash-card">
                <Clock size={32} color="#94A3B8" className="dv-empty-dash-icon" />
                <h4>No pending renewal deadlines</h4>
                <p>Deadlines are auto-created when policies with expiration dates are uploaded.</p>
              </Card>
            ) : (
              <div className="dv-deadline-list">
                {deadlines.slice(0, 4).map((d) => (
                  <Card key={d._id} padding="sm" className="dv-deadline-row">
                    <div className="dv-deadline-row__header">
                      <h4 className="dv-deadline-row__title">{d.title}</h4>
                      <Badge variant={d.severity === "urgent" ? "danger" : "warning"} size="sm">
                        {d.daysLeft ? `${d.daysLeft}d left` : "Upcoming"}
                      </Badge>
                    </div>
                    <p className="dv-deadline-row__action">{d.action || "Renewal required"}</p>
                    <span className="dv-deadline-row__date">Due Date: {d.date}</span>
                  </Card>
                ))}
              </div>
            )}

            {/* Quick Upload Action Widget */}
            <Card padding="md" className="dv-quick-upload-card">
              <div className="dv-quick-upload-card__content">
                <UploadCloud size={24} color="#2563EB" />
                <div>
                  <h4>Need to add a new document?</h4>
                  <p>Drag and drop files to initiate hybrid OCR parsing.</p>
                </div>
              </div>
              <Link to="/upload">
                <Button variant="outline" size="sm">Upload Document</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
