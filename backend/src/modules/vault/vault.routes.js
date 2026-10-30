import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { User } from '../auth/auth.model.js';
import { Document } from '../documents/document.model.js';
import { Asset } from '../assets/asset.model.js';
import { Deadline } from '../deadlines/deadline.model.js';
import { AuditLog } from './auditLog.model.js';

const router = Router();

// GET /api/vault/export - Export full encrypted vault metadata & document inventory as JSON backup
router.get('/export', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [user, docs, assets, deadlines] = await Promise.all([
      User.findById(userId).select('-passwordHash -pinHash'),
      Document.find({ userId }).select('-fileData'),
      Asset.find({ userId }),
      Deadline.find({ userId })
    ]);

    const backupBundle = {
      vaultVersion: '2.4.0',
      exportedAt: new Date().toISOString(),
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        tier: user?.tier || 'Encrypted Vault',
      },
      stats: {
        totalDocuments: docs.length,
        totalAssets: assets.length,
        totalDeadlines: deadlines.length,
      },
      documents: docs,
      assets: assets,
      deadlines: deadlines,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="docvault-backup-${Date.now()}.json"`);
    res.send(JSON.stringify(backupBundle, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate vault backup archive' });
  }
});

// GET /api/vault/audit-trail - Fetch real audit records for user
router.get('/audit-trail', requireAuth, async (req, res) => {
  try {
    const logs = await AuditLog.find({ userId: req.user.userId }).sort({ timestamp: -1 }).limit(50);
    const count = await AuditLog.countDocuments({ userId: req.user.userId });
    res.json({ success: true, count, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

