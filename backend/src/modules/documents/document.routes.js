import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';
import { Document, Deadline, AuditLog } from '../../models/index.js';
import { extractDocumentMetadata } from '../../services/ai/groqService.js';
import { generateEmbedding } from '../../services/ai/huggingFaceService.js';
import { extractTextFromPDF, extractTextFromImage, convertPdfToImages } from '../../services/ocr/ocrService.js';
import { sanitizeKeyDetails } from '../../utils/sanitize.js';

const router = Router();

// GET /api/documents - List documents with optional category filter & full-text search
router.get('/', requireAuth, async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = { userId: req.user.userId };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const documents = await Document.find(filter)
      .select('-fileData') // Exclude raw base64 data to keep payload fast
      .sort({ createdAt: -1 });

    res.json({ success: true, count: documents.length, data: documents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/documents/:id - Get single document details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.userId }).select('-fileData');
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Record audit trail
    await AuditLog.create({
      userId: req.user.userId,
      action: 'VIEW',
      documentTitle: doc.title,
      device: req.headers['user-agent'] || 'Web Client',
    }).catch(err => console.warn('[Audit Log] Failed to save view audit:', err.message));

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/documents/upload - Upload file with OCR & Groq AI extraction
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    const format = originalname.split('.').pop().toUpperCase();
    const fileSizeFormatted = size < 1024 * 1024 
      ? `${(size / 1024).toFixed(1)} KB` 
      : `${(size / (1024 * 1024)).toFixed(1)} MB`;

    console.log(`[Upload Pipeline] Processing file: ${originalname} (${format}, ${fileSizeFormatted})`);

    let extractedText = '';
    let visualBase64 = null;
    let visualMimeType = null;

    if (mimetype.includes('pdf')) {
      extractedText = await extractTextFromPDF(buffer);

      // Scanned PDF fallback
      if (!extractedText || extractedText.length < 50) {
        console.log('[OCR] PDF text layer minimal. Rendering PDF pages to image for visual OCR...');
        const imagePages = await convertPdfToImages(buffer);
        if (imagePages && imagePages.length > 0) {
          const firstPage = imagePages[0];
          extractedText = await extractTextFromImage(firstPage);
          visualBase64 = firstPage.toString('base64');
          visualMimeType = 'image/png';
        }
      }
    } else if (mimetype.startsWith('image/')) {
      extractedText = await extractTextFromImage(buffer);
      visualBase64 = buffer.toString('base64');
      visualMimeType = mimetype;
    }

    console.log(`[Upload Pipeline] Extracted text length: ${extractedText.length} characters`);

    // AI Semantic Extraction via Groq
    const metadata = await extractDocumentMetadata(extractedText, originalname, visualBase64, visualMimeType);
    console.log('[Upload Pipeline] Groq AI metadata extraction complete:', metadata.title);

    // Generate semantic embedding vector via Hugging Face
    let embedding = [];
    try {
      const textToEmbed = `${metadata.title} ${metadata.summary} ${(metadata.tags || []).join(' ')}`;
      embedding = await generateEmbedding(textToEmbed);
    } catch (embErr) {
      console.warn('[Embedding] Vector generation failed, continuing without embedding:', embErr.message);
    }

    const base64Data = buffer.toString('base64');

    const newDoc = new Document({
      userId: req.user.userId,
      title: metadata.title || originalname,
      originalName: originalname,
      category: metadata.category || 'Other',
      format: format,
      mimetype: mimetype,
      fileData: base64Data,
      sizeBytes: size,
      fileSizeFormatted: fileSizeFormatted,
      storagePath: 'mongodb-embedded',
      summary: metadata.summary,
      keyDetails: sanitizeKeyDetails(metadata.keyDetails),
      tags: metadata.tags || [],
      expiryDate: metadata.expiryDate,
      isExpiringSoon: metadata.isExpiringSoon || false,
      embedding: embedding,
    });

    newDoc.downloadUrl = `/api/documents/${newDoc._id}/download`;
    await newDoc.save();

    // Auto-create deadline reminder if expiry date was detected
    if (metadata.expiryDate) {
      try {
        const expiry = new Date(metadata.expiryDate);
        const today = new Date();
        const diffTime = expiry - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let severity = 'normal';
        if (daysLeft <= 15) severity = 'urgent';
        else if (daysLeft <= 45) severity = 'upcoming';

        await Deadline.create({
          userId: req.user.userId,
          title: `${newDoc.title} Renewal`,
          date: metadata.expiryDate,
          daysLeft: daysLeft,
          severity: severity,
          linkedDocId: newDoc._id,
          action: `Renew ${newDoc.category} policy / license`,
        });
        console.log(`[Deadline Auto-Create] Scheduled reminder for: ${metadata.expiryDate}`);
      } catch (dlErr) {
        console.warn('[Deadline Auto-Create] Failed to create reminder:', dlErr.message);
      }
    }

    // Record audit log
    await AuditLog.create({
      userId: req.user.userId,
      action: 'UPLOAD',
      documentTitle: newDoc.title,
      device: req.headers['user-agent'] || 'Web Client',
    }).catch(err => console.warn('[Audit Log] Failed to save upload audit:', err.message));

    const responseDoc = newDoc.toObject();
    delete responseDoc.fileData;

    res.status(201).json({
      success: true,
      message: 'Document uploaded and analyzed successfully',
      data: responseDoc,
    });
  } catch (err) {
    console.error('[Upload Pipeline Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/documents/:id/download - Stream document content directly
router.get('/:id/download', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).send('Document not found');
    }

    if (!doc.fileData) {
      return res.status(404).send('File content unavailable in database storage');
    }

    const fileBuffer = Buffer.from(doc.fileData, 'base64');
    res.setHeader('Content-Type', doc.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName || doc.title}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.send(fileBuffer);
  } catch (err) {
    res.status(500).send('Error streaming document file: ' + err.message);
  }
});

// PATCH /api/documents/:id - Update document details or link asset
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id;
    delete updates.userId;
    delete updates.fileData;
    delete updates.downloadUrl;
    delete updates.storagePath;

    if (updates.keyDetails) {
      updates.keyDetails = sanitizeKeyDetails(updates.keyDetails);
    }

    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: updates },
      { new: true }
    ).select('-fileData');

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/documents/:id - Delete document & clean up reminders
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found or access denied' });
    }

    await Document.deleteOne({ _id: doc._id });
    await Deadline.deleteMany({ linkedDocId: doc._id });

    // Record audit log
    await AuditLog.create({
      userId: req.user.userId,
      action: 'DELETE',
      documentTitle: doc.title,
      device: req.headers['user-agent'] || 'Web Client',
    }).catch(err => console.warn('[Audit Log] Failed to save delete audit:', err.message));

    res.json({ success: true, message: 'Document and linked reminders deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

