import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { ShieldCheck, Plus, Bell } from 'lucide-react';
import './AppLayout.css';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine page title based on route
  const getHeaderInfo = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'DocVault', showBrand: true };
      case '/documents':
        return { title: 'My Documents', showBrand: false };
      case '/ask-ai':
        return { title: 'Vault AI Assistant', showBrand: false };
      case '/assets':
        return { title: 'Tracked Assets', showBrand: false };
      case '/deadlines':
        return { title: 'Expiry & Reminders', showBrand: false };
      case '/more':
        return { title: 'Settings & Security', showBrand: false };
      case '/upload':
        return { title: 'Add Document', showBrand: false };
      default:
        return { title: 'DocVault', showBrand: false };
    }
  };

  const { title, showBrand } = getHeaderInfo();
  const isUploadPage = location.pathname === '/upload';

  return (
    <div className="app-container">
      {/* Top Header Bar */}
      <header className="top-header">
        <div className="top-header-left">
          {showBrand ? (
            <div className="brand-logo" onClick={() => navigate('/')}>
              <div className="brand-badge">
                <ShieldCheck size={18} color="#fff" />
              </div>
              <span className="brand-title">DocVault</span>
            </div>
          ) : (
            <h1 className="header-page-title">{title}</h1>
          )}
        </div>

        <div className="top-header-right">
          <button 
            className="icon-btn" 
            title="Lock Vault"
            onClick={() => {
              navigate('/more');
            }}
          >
            <ShieldCheck size={20} color="var(--primary)" />
          </button>

          <button 
            className="icon-btn" 
            title="Reminders & Deadlines"
            onClick={() => navigate('/deadlines')}
          >
            <Bell size={20} color="var(--text-secondary)" />
            <span className="notification-dot"></span>
          </button>
          
          {!isUploadPage && (
            <button 
              className="quick-upload-pill" 
              onClick={() => navigate('/upload')}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Upload</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-content">
        <Outlet />
      </main>

      {/* Persistent Bottom Bar */}
      <BottomNav />
    </div>
  );
}
