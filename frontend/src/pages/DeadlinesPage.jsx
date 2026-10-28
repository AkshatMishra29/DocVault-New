import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Bell,
  RefreshCw,
  Download,
  CheckCircle2
} from 'lucide-react';
import './DeadlinesPage.css';

export default function DeadlinesPage() {
  const navigate = useNavigate();
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncDone, setSyncDone] = useState(false);

  const fetchDeadlines = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/deadlines');
      const data = await res.json();
      if (data.success) {
        setDeadlines(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch deadlines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const handleDownloadCalendar = () => {
    window.open('http://localhost:5001/api/deadlines/calendar.ics', '_blank');
    setSyncDone(true);
    setTimeout(() => setSyncDone(false), 3000);
  };

  return (
    <div className="deadlines-page">
      <div className="deadlines-intro">
        <h2>Expiry & Auto-Reminders</h2>
        <p>Live alerts aggregated from your uploaded policies, warranties, and family assets.</p>
      </div>

      <div className="reminder-feed">
        {loading ? (
          <div className="deadlines-empty">
            <RefreshCw size={28} className="spin-icon" color="var(--primary)" />
            <p>Scanning documents and assets for deadlines...</p>
          </div>
        ) : deadlines.length === 0 ? (
          <div className="deadlines-empty">
            <Calendar size={42} color="var(--border-color)" />
            <h3>No upcoming deadlines</h3>
            <p>Upload documents with expiry dates or track vehicle & household assets to generate reminders.</p>
          </div>
        ) : (
          deadlines.map((dl) => (
            <div key={dl.id} className={`reminder-card ${dl.severity}`}>
              <div className="reminder-header">
                <div className="severity-badge">
                  {dl.severity === 'urgent' ? (
                    <AlertTriangle size={14} color="#EF4444" />
                  ) : (
                    <Clock size={14} color="#F59E0B" />
                  )}
                  <span>{dl.daysLeft} Days Remaining</span>
                </div>
                <span className="due-date">{dl.date}</span>
              </div>

              <h3 className="reminder-title">{dl.title}</h3>
              
              <div className="reminder-action-bar">
                <span className="recommended-action">{dl.action}</span>
                {dl.linkedDocId ? (
                  <button 
                    className="view-doc-link"
                    onClick={() => navigate(`/documents/${dl.linkedDocId}`)}
                  >
                    <span>View Attached Policy</span>
                    <ChevronRight size={14} />
                  </button>
                ) : dl.linkedAssetId ? (
                  <button 
                    className="view-doc-link"
                    onClick={() => navigate('/assets')}
                  >
                    <span>View Tracked Asset</span>
                    <ChevronRight size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sync Reminders Box */}
      <div className="sync-box">
        <Bell size={24} color="var(--primary)" />
        <div className="sync-info">
          <h4>Google Calendar & Apple iCal Sync</h4>
          <p>Export all upcoming renewals to your phone calendar in one click.</p>
        </div>
        <button 
          className="sync-btn" 
          onClick={handleDownloadCalendar}
        >
          {syncDone ? (
            <>
              <CheckCircle2 size={14} />
              <span>Exported</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Export .ICS</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

