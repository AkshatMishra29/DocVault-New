import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar/AppSidebar';
import BottomNav from './BottomNav';
import './AppLayout.css';

export default function AppLayout() {
  return (
    <div className="dv-app-shell">
      <AppSidebar />
      <main className="dv-app-main">
        <div className="dv-app-content-container">
          <Outlet />
        </div>
      </main>
      <div className="dv-mobile-nav-wrapper">
        <BottomNav />
      </div>
    </div>
  );
}
