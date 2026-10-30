import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { Asset } from './asset.model.js';
import { Document } from '../documents/document.model.js';

const router = Router();

// GET /api/assets - List all user assets
router.get('/', requireAuth, async (req, res) => {
  try {
    const assets = await Asset.find({ userId: req.user.userId }).populate('linkedDocumentIds');
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/assets - Add new asset
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, category, estimatedValue, purchaseDate, warrantyExpiry, insuranceExpiry, nextService, linkedDocumentIds, icon } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'Name and category are required' });
    }

    const asset = new Asset({
      userId: req.user.userId,
      name,
      category,
      estimatedValue,
      purchaseDate,
      warrantyExpiry,
      insuranceExpiry,
      nextService,
      icon: icon || 'FileText',
      linkedDocumentIds: linkedDocumentIds || [],
    });

    await asset.save();

    // Bi-directionally link documents if specified
    if (linkedDocumentIds && linkedDocumentIds.length > 0) {
      await Document.updateMany(
        { _id: { $in: linkedDocumentIds }, userId: req.user.userId },
        { $addToSet: { tags: category } }
      );
    }

    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/assets/:id - Remove asset
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found or access denied' });
    }
    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

