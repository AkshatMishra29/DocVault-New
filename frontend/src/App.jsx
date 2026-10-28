import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import AskAiPage from './pages/AskAiPage';
import AssetsPage from './pages/AssetsPage';
import DeadlinesPage from './pages/DeadlinesPage';
import UploadPage from './pages/UploadPage';
import MorePage from './pages/MorePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EnterPinPage from './pages/EnterPinPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/enter-pin" element={<EnterPinPage />} />

          {/* Protected Application Routes (Requires Verified PIN) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="documents/:id" element={<DocumentDetailPage />} />
            <Route path="ask-ai" element={<AskAiPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="deadlines" element={<DeadlinesPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="more" element={<MorePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
