import { API_BASE_URL } from '../../services/api';
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  Camera, 
  File, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  FolderOpen,
  AlertCircle
} from 'lucide-react';
import './UploadPage.css';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [selectedFileObj, setSelectedFileObj] = useState(null); // Actual File object
  const [fileMeta, setFileMeta] = useState(null); // Display name and size
  const [uploadStep, setUploadStep] = useState('select'); // 'select', 'processing', 'completed'
  const [docCategory, setDocCategory] = useState('Insurance');
  const [extractedData, setExtractedData] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileObj(file);
      setFileMeta({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
      setUploadError('');
    }
  };

  const handleRealUpload = async () => {
    if (!selectedFileObj) return;

    setUploadStep('processing');
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFileObj);
      formData.append('category', docCategory);

      const token = localStorage.getItem('docvault_token');
      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || resData.error || 'Upload failed');
      }

      setExtractedData(resData.data);
      setUploadStep('completed');
    } catch (err) {
      console.error('Upload Error:', err);
      setUploadError(err.message);
      setUploadStep('select');
    }
  };

  return (
    <div className="upload-page">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".pdf,image/*" 
        style={{ display: 'none' }} 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        style={{ display: 'none' }} 
      />

      {uploadStep === 'select' && (
        <div className="step-container">
          <div className="upload-intro">
            <h2>Add Document to Vault</h2>
            <p>Files are stored in your private Firebase storage and analyzed by Groq AI.</p>
          </div>

          {uploadError && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Drag & Drop / File Input Box */}
          <div 
            className="drop-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-icon-circle">
              <UploadCloud size={32} color="var(--primary)" />
            </div>
            <h3>Tap to Choose File or Scan</h3>
            <p>Supports PDF, JPG, PNG, scanned documents (up to 25MB)</p>
            <div className="source-options">
              <button 
                type="button"
                className="source-btn" 
                onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              >
                <Camera size={16} />
                <span>Camera Scan</span>
              </button>
              <button 
                type="button"
                className="source-btn" 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <FolderOpen size={16} />
                <span>Browse Files</span>
              </button>
            </div>
          </div>

          {/* Selected File Review */}
          {fileMeta && (
            <div className="file-preview-card">
              <div className="file-info-col">
                <File size={22} color="var(--primary)" />
                <div>
                  <h4 className="file-name">{fileMeta.name}</h4>
                  <span className="file-size">{fileMeta.size} • Ready for AI extraction</span>
                </div>
              </div>
              <button 
                type="button"
                className="remove-file-btn" 
                onClick={() => { setSelectedFileObj(null); setFileMeta(null); }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Category Selector */}
          <div className="category-select-group">
            <label className="field-label">Document Category</label>
            <select 
              className="custom-select" 
              value={docCategory} 
              onChange={(e) => setDocCategory(e.target.value)}
            >
              <option value="Insurance">Insurance & Policies</option>
              <option value="Appliances">Invoices & Warranties</option>
              <option value="Identity">Government Identity (KYC)</option>
              <option value="Property">Real Estate & Legal</option>
              <option value="Medical">Health & Medical Records</option>
              <option value="Other">Other Documents</option>
            </select>
          </div>

          <div className="security-notice">
            <Lock size={16} color="var(--primary)" />
            <span>Encrypted Storage: Uploaded to private Firebase Storage bucket.</span>
          </div>

          <button 
            type="button"
            className="btn-primary start-upload-btn"
            disabled={!selectedFileObj}
            onClick={handleRealUpload}
          >
            <Sparkles size={18} />
            <span>Upload & Run Groq AI Extraction</span>
          </button>
        </div>
      )}

      {uploadStep === 'processing' && (
        <div className="processing-container">
          <div className="encryption-pulse">
            <Lock size={36} color="var(--primary)" />
          </div>
          <h3>Securing & Processing Document</h3>
          <p>Uploading to Firebase, extracting text, and parsing policy dates via Groq Llama-3.3...</p>
          <div className="stepper-status">
            <div className="step-item active">✓ Uploading to Firebase Storage bucket</div>
            <div className="step-item active">✓ Extracting PDF text & metadata</div>
            <div className="step-item in-progress">⌛ Groq Llama-3.3 entity & expiry parsing...</div>
          </div>
        </div>
      )}

      {uploadStep === 'completed' && extractedData && (
        <div className="completed-container">
          <div className="completed-icon">
            <CheckCircle2 size={48} color="#10B981" />
          </div>
          <h3>Document Secured!</h3>
          <p>Stored in Firebase, indexed in MongoDB, and expiry reminders registered.</p>

          <div className="extracted-preview-box">
            <h4>Extracted Highlights (by Groq AI):</h4>
            <ul>
              <li><strong>Title:</strong> {extractedData.title}</li>
              <li><strong>Category:</strong> {extractedData.category}</li>
              <li><strong>Summary:</strong> {extractedData.summary}</li>
              {extractedData.expiryDate && (
                <li><strong>Expiry Detected:</strong> {extractedData.expiryDate}</li>
              )}
            </ul>
          </div>

          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate('/documents')}>
              <span>View in Document Vault</span>
              <ArrowRight size={16} />
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setSelectedFileObj(null);
                setFileMeta(null);
                setExtractedData(null);
                setUploadStep('select');
              }}
            >
              <span>Upload Another</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
