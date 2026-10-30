import React, { useState, useEffect } from "react";
import { apiRequest } from "../../services/api";
import { Plus, Trash2, Calendar, FileText, Layers, ShieldCheck, AlertCircle } from "lucide-react";

import AppHeader from "../../components/layout/AppHeader/AppHeader";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Badge from "../../components/common/Badge/Badge";
import Input from "../../components/common/Input/Input";
import Modal from "../../components/common/Modal/Modal";
import EmptyState from "../../components/common/EmptyState/EmptyState";

import emptyAssetsImg from "../../assets/illustrations/empty-assets.svg";
import "./AssetsPage.css";

const ASSET_CATEGORIES = ["Vehicle", "Home Appliances", "Electronics", "Real Estate", "Other"];

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Vehicle",
    estimatedValue: "",
    purchaseDate: "",
    warrantyExpiry: "",
    insuranceExpiry: "",
    nextService: "",
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest("/api/assets");
      if (res.success && res.data) {
        setAssets(res.data);
      } else {
        setAssets([]);
      }
    } catch (err) {
      setError("Failed to load asset inventory.");
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setSubmitting(true);
    try {
      const res = await apiRequest("/api/assets", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (res.success && res.data) {
        setAssets((prev) => [res.data, ...prev]);
        setShowAddModal(false);
        setFormData({
          name: "",
          category: "Vehicle",
          estimatedValue: "",
          purchaseDate: "",
          warrantyExpiry: "",
          insuranceExpiry: "",
          nextService: "",
        });
      }
    } catch (err) {
      alert("Failed to create asset: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm("Are you sure you want to remove this tracked asset?")) return;
    try {
      const res = await apiRequest(`/api/assets/${id}`, { method: "DELETE" });
      if (res.success) {
        setAssets((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      alert("Failed to delete asset: " + err.message);
    }
  };

  return (
    <div className="dv-assets-page">
      <AppHeader
        title="Asset & Warranty Registry"
        subtitle="Track vehicles, home appliances, and electronics with cross-linked insurance and invoices."
      />

      <div className="dv-assets-content">
        <div className="dv-assets-toolbar">
          <div className="dv-assets-count">
            <strong>{assets.length}</strong> Registered Asset(s)
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add Asset
          </Button>
        </div>

        {error && (
          <div className="dv-assets-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="dv-docs-loading">
            <div className="dv-btn__spinner" />
            <span>Loading asset registry...</span>
          </div>
        ) : assets.length === 0 ? (
          <EmptyState
            illustration={emptyAssetsImg}
            title="No tracked assets yet"
            description="Add your car, laptop, air conditioner, or property deeds to cross-link warranties and policy schedules."
            actionLabel="Add Your First Asset"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <div className="dv-assets-grid">
            {assets.map((asset) => (
              <Card key={asset._id} hover padding="md" className="dv-asset-card">
                <div className="dv-asset-card__header">
                  <Badge variant="primary" size="sm">{asset.category}</Badge>
                  <button
                    className="dv-asset-delete-btn"
                    onClick={() => handleDeleteAsset(asset._id)}
                    aria-label="Delete Asset"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="dv-asset-card__body">
                  <h3 className="dv-asset-card__title">{asset.name}</h3>
                  {asset.estimatedValue && (
                    <span className="dv-asset-card__val">Value: {asset.estimatedValue}</span>
                  )}
                </div>

                <div className="dv-asset-card__dates">
                  {asset.warrantyExpiry && (
                    <div className="dv-asset-date-row">
                      <span className="dv-text-muted">Warranty Expiry:</span>
                      <strong>{asset.warrantyExpiry}</strong>
                    </div>
                  )}
                  {asset.insuranceExpiry && (
                    <div className="dv-asset-date-row">
                      <span className="dv-text-muted">Insurance Expiry:</span>
                      <strong>{asset.insuranceExpiry}</strong>
                    </div>
                  )}
                  {asset.nextService && (
                    <div className="dv-asset-date-row">
                      <span className="dv-text-muted">Next Service:</span>
                      <strong>{asset.nextService}</strong>
                    </div>
                  )}
                </div>

                <div className="dv-asset-card__footer">
                  <span className="dv-asset-linked-count">
                    <FileText size={13} /> {asset.linkedDocumentIds?.length || 0} Linked Document(s)
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Household or Vehicle Asset"
      >
        <form onSubmit={handleCreateAsset} className="dv-asset-form">
          <Input
            label="Asset Name"
            placeholder="e.g. 2024 Honda City, MacBook Pro 16"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />

          <div className="dv-form-group">
            <label className="dv-input-label">Category</label>
            <select
              className="dv-select-control"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
            >
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <Input
            label="Estimated Value / Purchase Price"
            placeholder="e.g. $2,400 or ₹14,50,000"
            value={formData.estimatedValue}
            onChange={(e) => handleInputChange("estimatedValue", e.target.value)}
          />

          <Input
            label="Warranty Expiry Date"
            type="date"
            value={formData.warrantyExpiry}
            onChange={(e) => handleInputChange("warrantyExpiry", e.target.value)}
          />

          <Input
            label="Insurance Expiry Date"
            type="date"
            value={formData.insuranceExpiry}
            onChange={(e) => handleInputChange("insuranceExpiry", e.target.value)}
          />

          <div className="dv-modal-form-actions">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Save Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
