import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight,
  ShieldCheck, Sparkles, Layers
} from "lucide-react";

import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import "./UploadPage.css";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [error, setError] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState(null);

  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError("");
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Supported file types are PDF, PNG, JPG, and WEBP.");
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError("File exceeds maximum allowable size of 25 MB.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    setProgressStage("Pre-processing image / rendering PDF buffer via Sharp...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setTimeout(() => {
        setProgressStage("Running local Tesseract OCR & Groq multimodal vision...");
      }, 1200);

      setTimeout(() => {
        setProgressStage("Extracting keyDetails & calculating Hugging Face dense embeddings...");
      }, 2400);

      const res = await apiRequest("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (res.success && res.data) {
        setUploadedDoc(res.data);
      } else {
        setError(res.error || "Document upload failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to process document upload.");
    } finally {
      setUploading(false);
      setProgressStage("");
    }
  };

  return (
    <div className="dv-upload-page">
      <AppHeader
        title="Document Ingestion"
        subtitle="Multi-tier optical character recognition, automated classification, and deadline extraction."
      />

      <div className="dv-upload-content">
        {!uploadedDoc ? (
          <div className="dv-upload-grid">
            {/* Left: Dropzone Area */}
            <Card padding="lg" className="dv-dropzone-card">
              <div
                className={`dv-dropzone ${dragActive ? "dv-dropzone--active" : ""} ${file ? "dv-dropzone--has-file" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="dv-file-input"
                  className="dv-file-input-hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                />

                {!file ? (
                  <label htmlFor="dv-file-input" className="dv-dropzone-label">
                    <div className="dv-dropzone-icon-box">
                      <UploadCloud size={36} color="#2563EB" />
                    </div>
                    <h3 className="dv-dropzone-title">Click to upload or drag and drop</h3>
                    <p className="dv-dropzone-sub">
                      PDF, Scanned PDFs, PNG, JPG, WEBP (Max 25 MB)
                    </p>
                  </label>
                ) : (
                  <div className="dv-file-selected-box">
                    <FileText size={36} color="#2563EB" />
                    <div className="dv-file-selected-meta">
                      <span className="dv-file-selected-name">{file.name}</span>
                      <span className="dv-file-selected-size">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    {!uploading && (
                      <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                        Change File
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="dv-upload-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {uploading && (
                <div className="dv-upload-progress-box">
                  <div className="dv-btn__spinner" />
                  <span className="dv-upload-progress-text">{progressStage}</span>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                disabled={!file || uploading}
                loading={uploading}
                icon={ArrowRight}
                iconPosition="right"
                onClick={handleUpload}
                className="dv-upload-submit-btn"
              >
                Execute Hybrid OCR & Extraction
              </Button>
            </Card>

            {/* Right: Pipeline Transparency Showcase */}
            <Card padding="lg" className="dv-upload-info-card">
              <h3 className="dv-pipeline-title">DocVault OCR & Extraction Flow</h3>
              <p className="dv-pipeline-sub">All processing adheres to strict tenant isolation.</p>

              <div className="dv-pipeline-steps">
                <div className="dv-pstep">
                  <span className="dv-pstep-num">1</span>
                  <div>
                    <h4>Sharp Conditioning</h4>
                    <p>Image grayscaling, dynamic range normalization, and contrast sharpening.</p>
                  </div>
                </div>

                <div className="dv-pstep">
                  <span className="dv-pstep-num">2</span>
                  <div>
                    <h4>Local Tesseract OCR</h4>
                    <p>Wasm-based local text recognition ensuring rapid, private processing.</p>
                  </div>
                </div>

                <div className="dv-pstep">
                  <span className="dv-pstep-num">3</span>
                  <div>
                    <h4>Groq Multimodal Vision (Qwen 3.8 27B)</h4>
                    <p>Multimodal fallback for heavily degraded, tilted, or blurry paperwork.</p>
                  </div>
                </div>

                <div className="dv-pstep">
                  <span className="dv-pstep-num">4</span>
                  <div>
                    <h4>Automated Deadline Scheduling</h4>
                    <p>Detected expiration dates automatically populate renewal calendars.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Post-Upload Success Summary */
          <Card padding="lg" className="dv-upload-success-card">
            <div className="dv-success-header">
              <div className="dv-success-badge-icon">
                <CheckCircle2 size={32} color="#059669" />
              </div>
              <h2 className="dv-success-title">Document Analyzed & Saved to Vault</h2>
              <p className="dv-success-sub">All entities extracted, vectorized, and indexed.</p>
            </div>

            <div className="dv-success-meta-box">
              <div className="dv-success-meta-row">
                <span className="dv-smeta-label">Document Title:</span>
                <span className="dv-smeta-val"><strong>{uploadedDoc.title}</strong></span>
              </div>
              <div className="dv-success-meta-row">
                <span className="dv-smeta-label">Detected Category:</span>
                <span className="dv-smeta-val">{uploadedDoc.category}</span>
              </div>
              {uploadedDoc.expiryDate && (
                <div className="dv-success-meta-row">
                  <span className="dv-smeta-label">Detected Expiry:</span>
                  <span className="dv-smeta-val dv-text-warning">
                    <strong>{uploadedDoc.expiryDate} (Scheduled in Deadlines)</strong>
                  </span>
                </div>
              )}
              <div className="dv-success-meta-row">
                <span className="dv-smeta-label">Automated Summary:</span>
                <span className="dv-smeta-val">{uploadedDoc.summary}</span>
              </div>
            </div>

            <div className="dv-success-actions">
              <Button
                variant="secondary"
                size="md"
                onClick={() => { setUploadedDoc(null); setFile(null); }}
              >
                Upload Another Document
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/documents/${uploadedDoc._id}`)}
              >
                Inspect Extracted Details
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
