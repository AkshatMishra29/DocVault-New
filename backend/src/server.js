import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import { config } from './config.js';
import { uploadToFirebase, deleteFromFirebase } from './services/firebaseService.js';
import { extractDocumentMetadata, answerDocumentQuery } from './services/groqService.js';
import { generateEmbedding } from './services/huggingFaceService.js';
import { Document, Asset, Deadline, User, AuditLog } from './models/index.js';

const app = express();

// Middleware - Security & CORS Whitelist
const allowedOrigins = [
  'https://docvault-new-1.onrender.com',
  'https://docvault-new.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5001'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl or same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during transition, or restrict if strict
    }
  },
  credentials: true,
}));

app.use(express.json());

// Memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

// Helper to sanitize keys for MongoDB Map storage (no dots or special characters)
function sanitizeKeyDetails(details) {
  if (!details || typeof details !== 'object') return {};
  const sanitized = {};
  for (const [k, v] of Object.entries(details)) {
    const safeKey = String(k).replace(/[.\$]/g, '_').trim();
    sanitized[safeKey] = typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
  return sanitized;
}

// Authentication middleware to isolate customer data
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Allow download token via query param for direct <a> or window.open links
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (!err && user) {
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  });
}

function requireAuth(req, res, next) {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Access token required' });
  }
  next();
}

app.use(authenticateToken);

/* ==========================================================================
   1. Health & Service Verification API
   ========================================================================== */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected',
      groqApi: Boolean(config.groq.apiKey),
      huggingFaceApi: Boolean(config.huggingFace.apiKey),
      storage: 'MongoDB Internal Binary Storage (Database-backed)',
    },
    timestamp: new Date().toISOString(),
  });
});

/* ==========================================================================
   1b. Authentication & Vault PIN APIs
   ========================================================================== */

// POST /api/auth/register - Register with Email, Password & 4-to-6 digit PIN
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, pin, phone } = req.body;
    if (!name || !email || !password || !pin) {
      return res.status(400).json({ success: false, error: 'Name, email, password, and PIN are required.' });
    }

    if (pin.length < 4 || pin.length > 6) {
      return res.status(400).json({ success: false, error: 'PIN must be between 4 and 6 digits.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const pinHash = await bcrypt.hash(pin, salt);

    const user = new User({
      name,
      email,
      passwordHash,
      pinHash,
      phone: phone || '',
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Vault account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login - Step 1: Login with Email & Password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Return temporary session token requiring PIN validation to unlock vault
    const pinSessionToken = jwt.sign(
      { userId: user._id, requiresPin: true },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      requiresPin: true,
      pinSessionToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/verify-pin - Step 2: Verify 4-6 digit PIN to unlock application vault
app.post('/api/auth/verify-pin', async (req, res) => {
  try {
    const { email, pin } = req.body;
    if (!email || !pin) {
      return res.status(400).json({ success: false, error: 'Email and PIN are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const isPinValid = await bcrypt.compare(pin, user.pinHash);
    if (!isPinValid) {
      return res.status(401).json({ success: false, error: 'Incorrect Vault PIN. Please try again.' });
    }

    // Vault unlocked! Issue full access token
    const token = jwt.sign(
      { userId: user._id, email: user.email, unlocked: true },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Vault unlocked successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ==========================================================================
   2. Document APIs
   ========================================================================== */

// GET /api/documents - Fetch all documents with optional search & category filter
app.get('/api/documents', requireAuth, async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = { userId: req.user.userId };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { summary: { $regex: q, $options: 'i' } },
      ];
    }

    // Exclude large fileData payload when listing documents for fast response
    const docs = await Document.find(filter).select('-fileData').sort({ createdAt: -1 });
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/documents/:id - Single document details
app.get('/api/documents/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.userId }).select('-fileData');
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found or access denied' });
    }
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/documents/upload - Upload file, run OCR (PDF / Tesseract), Groq & Hugging Face
app.post('/api/documents/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const originalName = req.file.originalname;
    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const sizeBytes = req.file.size;
    const fileSizeFormatted = (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';

    // 1. Process File Buffer & Convert to Base64 (Internal DB Storage)
    const fileDataBase64 = buffer.toString('base64');
    const storagePath = `db_${Date.now()}_${originalName}`;

    // Extract text from PDF or OCR for images (JPG, PNG, WEBP)
    let extractedText = '';
    let previewImageBase64 = null;

    if (mimetype.includes('pdf')) {
      try {
        const parser = new PDFParse({ data: buffer });
        const parsedResult = await parser.getText();
        if (parsedResult && parsedResult.text && parsedResult.text.trim().length > 30) {
          extractedText = parsedResult.text.trim();
        } else {
          // Scanned PDF detected (no digital text layer)
          console.log(`[Scanned PDF Detected] No selectable text in ${originalName}. Converting page 1 for OCR...`);
          try {
            const pdfImg = await import('pdf-img-convert');
            const pageImages = await pdfImg.default.convert(buffer, { page_numbers: [1], scale: 1.5 });
            if (pageImages && pageImages.length > 0) {
              const pageBuffer = Buffer.from(pageImages[0]);
              previewImageBase64 = pageBuffer.toString('base64');
              console.log(`[Tesseract OCR] Running local OCR on page 1 of scanned PDF...`);
              const { data: { text } } = await Tesseract.recognize(pageBuffer, 'eng');
              if (text && text.trim()) {
                extractedText = text.trim();
                console.log(`[Tesseract OCR Success] Extracted ${extractedText.length} characters from scanned PDF.`);
              }
            }
          } catch (renderErr) {
            console.warn('[PDF Render Warning]:', renderErr.message);
          }
        }
      } catch (pdfErr) {
        console.warn('[PDFParse Warning]:', pdfErr.message);
      }
    } else if (mimetype.includes('image') || /\.(jpe?g|png|webp|bmp|tiff)$/i.test(originalName)) {
      previewImageBase64 = fileDataBase64;
      try {
        console.log(`[OCR Preprocessing] Optimizing image ${originalName} with Sharp for maximum text extraction...`);
        // Preprocess image: convert to grayscale, normalize contrast, resize if small, sharpen edges
        let optimizedBuffer = buffer;
        try {
          optimizedBuffer = await sharp(buffer)
            .grayscale()
            .normalize()
            .sharpen()
            .toBuffer();
        } catch (sharpErr) {
          console.warn('[Sharp Warning] Preprocessing bypassed, using raw buffer:', sharpErr.message);
          optimizedBuffer = buffer;
        }

        console.log(`[Tesseract OCR] Running optical character recognition on image: ${originalName}...`);
        const { data: { text } } = await Tesseract.recognize(optimizedBuffer, 'eng');
        if (text && text.trim()) {
          extractedText = text.trim();
          console.log(`[Tesseract OCR Success] Extracted ${extractedText.length} characters from ${originalName}`);
        }
      } catch (ocrErr) {
        console.warn('[Tesseract OCR Warning]:', ocrErr.message);
      }
    }

    // 2. Extract metadata via Groq (with Groq Vision fallback if local OCR extracted < 20 chars)
    let metadata = { title: originalName, summary: '', tags: [], category: 'Other', keyDetails: {} };
    try {
      metadata = await extractDocumentMetadata(extractedText, originalName, previewImageBase64);
      if (metadata.extractedText && !extractedText) {
        extractedText = metadata.extractedText;
      }
    } catch (groqErr) {
      console.warn('[Groq Warning] Metadata extraction fallback:', groqErr.message);
    }

    // 3. Generate embedding via Hugging Face
    let embedding = [];
    try {
      const textToEmbed = `${metadata.title} ${metadata.summary} ${(metadata.tags || []).join(' ')} ${extractedText.slice(0, 500)}`;
      embedding = await generateEmbedding(textToEmbed);
    } catch (hfErr) {
      console.warn('[HuggingFace Warning] Embedding fallback:', hfErr.message);
    }

    // 4. Save to MongoDB
    const doc = new Document({
      userId: req.user?.userId || null,
      title: metadata.title || originalName,
      originalName,
      category: metadata.category || req.body.category || 'Other',
      format: mimetype.includes('pdf') ? 'PDF' : 'Image',
      mimetype,
      fileData: fileDataBase64,
      sizeBytes,
      fileSizeFormatted,
      storagePath,
      summary: metadata.summary,
      keyDetails: sanitizeKeyDetails(metadata.keyDetails),
      tags: metadata.tags || [],
      expiryDate: metadata.expiryDate,
      isExpiringSoon: Boolean(metadata.expiryDate),
      embedding,
    });

    // Generate self-hosted download URL
    doc.downloadUrl = `/api/documents/${doc._id}/download`;

    await doc.save();

    // If an expiry date is detected, automatically create a deadline reminder
    if (metadata.expiryDate) {
      const today = new Date();
      const exp = new Date(metadata.expiryDate);
      const diffTime = exp.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      await Deadline.create({
        userId: req.user?.userId || null,
        title: `${metadata.title} Expiry`,
        date: metadata.expiryDate,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        severity: daysLeft < 30 ? 'urgent' : 'upcoming',
        linkedDocId: doc._id,
        action: 'Review / Renew Document',
      });
    }

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('[Upload Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/documents/:id/download - Stream/Download document binary from DB (Protected)
app.get('/api/documents/:id/download', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc || !doc.fileData) {
      return res.status(404).send('Document file not found.');
    }

    // Tenant check: ensure only the owner can download (if document is bound to a user)
    if (doc.userId && req.user?.userId && doc.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).send('Access Denied: You do not own this document.');
    }

    const fileBuffer = Buffer.from(doc.fileData, 'base64');
    res.setHeader('Content-Type', doc.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalName)}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.send(fileBuffer);
  } catch (err) {
    console.error('[Download Error]:', err);
    res.status(500).send('Error downloading file');
  }
});

// DELETE /api/documents/:id - Delete document from MongoDB (Protected)
app.delete('/api/documents/:id', requireAuth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found or access denied' });
    }

    await Document.findByIdAndDelete(req.params.id);
    await Deadline.deleteMany({ linkedDocId: req.params.id, userId: req.user.userId });

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ==========================================================================
   3. AI Q&A API (Groq + RAG)
   ========================================================================== */
app.post('/api/ai/query', requireAuth, async (req, res) => {
  try {
    const { question, docId } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    let contextDocs = [];
    let contextAssets = [];
    const userFilter = { userId: req.user.userId };

    if (docId) {
      const doc = await Document.findOne({ _id: docId, userId: req.user.userId });
      if (doc) contextDocs = [doc];
    } else {
      contextDocs = await Document.find(userFilter).sort({ createdAt: -1 }).limit(10);
      contextAssets = await Asset.find(userFilter).limit(20);
    }

    const answer = await answerDocumentQuery(question, contextDocs, contextAssets);

    res.json({
      success: true,
      answer,
      sources: [
        ...contextDocs.map(d => ({ title: d.title, category: d.category, type: 'Document' })),
        ...contextAssets.map(a => ({ title: a.name, category: a.category, type: 'Asset' })),
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ==========================================================================
   4. Assets API
   ========================================================================== */
app.get('/api/assets', requireAuth, async (req, res) => {
  try {
    const assets = await Asset.find({ userId: req.user.userId }).populate('linkedDocumentIds');
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/assets', requireAuth, async (req, res) => {
  try {
    const asset = new Asset({
      ...req.body,
      userId: req.user.userId,
    });
    await asset.save();
    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/assets/:id', requireAuth, async (req, res) => {
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

/* ==========================================================================
   5. Deadlines & Reminders API
   ========================================================================== */
app.get('/api/deadlines', requireAuth, async (req, res) => {
  try {
    const deadlines = await Deadline.find({ userId: req.user.userId }).populate('linkedDocId').sort({ date: 1 });
    res.json({ success: true, data: deadlines });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/deadlines/calendar.ics - Export standard iCalendar file (Apple/Google sync)
app.get('/api/deadlines/calendar.ics', async (req, res) => {
  try {
    const filter = req.user?.userId ? { userId: req.user.userId } : {};
    const deadlines = await Deadline.find(filter).sort({ date: 1 });

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DocVault//Renewal Deadlines//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    const todayStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    for (const item of deadlines) {
      if (!item.date) continue;
      const cleanDate = item.date.replace(/-/g, '').slice(0, 8);
      const uid = `${item._id}@docvault.app`;
      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${todayStr}`,
        `DTSTART;VALUE=DATE:${cleanDate}`,
        `SUMMARY:DocVault Reminder: ${item.title.replace(/[\r\n]/g, ' ')}`,
        `DESCRIPTION:${(item.action || 'Renew document').replace(/[\r\n]/g, ' ')}. Days remaining: ${item.daysLeft}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');
    const icsContent = lines.join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="docvault-deadlines.ics"');
    res.send(icsContent);
  } catch (err) {
    res.status(500).send('Error generating calendar file');
  }
});

/* ==========================================================================
   6. Vault Export & Settings API
   ========================================================================== */

// GET /api/vault/export - Export full encrypted vault metadata & document inventory as JSON backup
app.get('/api/vault/export', requireAuth, async (req, res) => {
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
app.get('/api/vault/audit-trail', requireAuth, async (req, res) => {
  try {
    const logs = await AuditLog.find({ userId: req.user.userId }).sort({ timestamp: -1 }).limit(50);
    const count = await AuditLog.countDocuments({ userId: req.user.userId });
    res.json({ success: true, count, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ==========================================================================
   Server Initialization
   ========================================================================== */
async function startServer() {
  try {
    console.log('[MongoDB] Connecting to cluster...');
    await mongoose.connect(config.mongoUri);
    console.log('[MongoDB] Connected successfully to Atlas cluster!');

    app.listen(config.port, () => {
      console.log(`[DocVault Server] API running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('[Server Error] Failed to start:', err.message);
  }
}

startServer();
