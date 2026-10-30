import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest, API_BASE_URL } from "../../services/api";
import { Calendar, Download, AlertTriangle, Clock, CheckCircle2, FileText } from "lucide-react";

import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import EmptyState from "../../components/common/EmptyState/EmptyState";

import emptyDeadlinesImg from "../../assets/illustrations/empty-deadlines.svg";
import "./DeadlinesPage.css";

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDeadlines();
  }, []);

  async function fetchDeadlines() {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest("/api/deadlines");
      if (res.success && res.data) {
        setDeadlines(res.data);
      } else {
        setDeadlines([]);
      }
    } catch (err) {
      setError("Failed to retrieve deadline schedules.");
    } finally {
      setLoading(false);
    }
  }

  const token = localStorage.getItem("token");
  const calendarIcsUrl = `${API_BASE_URL}/api/deadlines/calendar.ics?token=${token}`;

  return (
    <div className="dv-deadlines-page">
      <AppHeader
        title="Renewal & Expiry Deadlines"
        subtitle="Automated countdown schedules derived from policy and warranty expiration dates."
      />

      <div className="dv-deadlines-content">
        <div className="dv-deadlines-toolbar">
          <div className="dv-deadlines-count">
            <strong>{deadlines.length}</strong> Scheduled Deadline(s)
          </div>

          <a href={calendarIcsUrl} download="docvault-deadlines.ics">
            <Button variant="secondary" size="md" icon={Download}>
              Export to Apple / Google Calendar (.ICS)
            </Button>
          </a>
        </div>

        {error && (
          <div className="dv-deadlines-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="dv-docs-loading">
            <div className="dv-btn__spinner" />
            <span>Syncing renewal schedules...</span>
          </div>
        ) : deadlines.length === 0 ? (
          <EmptyState
            illustration={emptyDeadlinesImg}
            title="No upcoming policy deadlines"
            description="When you upload documents containing expiration dates, DocVault automatically creates tracked reminders."
            actionLabel="Upload Document to Schedule"
            onAction={() => window.location.href = "/upload"}
          />
        ) : (
          <div className="dv-deadlines-list">
            {deadlines.map((d) => {
              const isUrgent = d.severity === "urgent" || (d.daysLeft && d.daysLeft <= 15);
              return (
                <Card key={d._id} hover padding="md" className="dv-deadline-card">
                  <div className="dv-deadline-card__left">
                    <div className={`dv-dicon-box ${isUrgent ? "dv-dicon-box--urgent" : "dv-dicon-box--normal"}`}>
                      <Calendar size={20} />
                    </div>
                    <div className="dv-deadline-card__info">
                      <div className="dv-deadline-card__title-row">
                        <h3 className="dv-deadline-card__title">{d.title}</h3>
                        <Badge variant={isUrgent ? "danger" : "warning"} size="sm">
                          {d.daysLeft ? `${d.daysLeft} days remaining` : "Upcoming"}
                        </Badge>
                      </div>
                      <p className="dv-deadline-card__action">{d.action || "Renewal required"}</p>
                      <span className="dv-deadline-card__date">Expiration: <strong>{d.date}</strong></span>
                    </div>
                  </div>

                  {d.linkedDocId && (
                    <div className="dv-deadline-card__right">
                      <Link to={`/documents/${typeof d.linkedDocId === "object" ? d.linkedDocId._id : d.linkedDocId}`}>
                        <Button variant="ghost" size="sm" icon={FileText}>
                          View Policy
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
