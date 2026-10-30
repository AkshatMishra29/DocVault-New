import React from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { LogOut, ShieldCheck } from 'lucide-react';
import Button from '../../common/Button/Button';
import './AppHeader.css';

export default function AppHeader({ title, subtitle }) {
  const { user, logout } = useAuth();

  return (
    <header className="dv-app-header">
      <div className="dv-app-header__title-group">
        <h1 className="dv-app-header__title">{title}</h1>
        {subtitle && <p className="dv-app-header__subtitle">{subtitle}</p>}
      </div>

      <div className="dv-app-header__actions">
        <div className="dv-app-header__user-pill">
          <ShieldCheck size={16} className="dv-app-header__shield-icon" />
          <span className="dv-app-header__user-email">{user?.email || 'Authenticated User'}</span>
        </div>

        <Button variant="ghost" size="sm" icon={LogOut} onClick={logout}>
          Lock Vault
        </Button>
      </div>
    </header>
  );
}

