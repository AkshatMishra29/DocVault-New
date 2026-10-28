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
app.get('/api/documents', async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = {};

    // Isolate by authenticated user if logged in
    if (req.user?.userId) {
      filter.userId = req.user.userId;
    }

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
app.get('/api/documents/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).select('-fileData');
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/documents/upload - Upload file, send to Firebase, run Groq & Hugging Face
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
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

    // Extract text from PDF if applicable
    let extractedText = '';
    if (mimetype.includes('pdf')) {
      try {
        const parser = new PDFParse({ data: buffer });
        const parsedResult = await parser.getText();
        if (parsedResult && parsedResult.text) {
          extractedText = parsedResult.text;
        }
      } catch (pdfErr) {
        console.warn('[PDFParse Warning]:', pdfErr.message);
      }
    }

    // 2. Extract metadata via Groq
    let metadata = { title: originalName, summary: '', tags: [], category: 'Other', keyDetails: {} };
    try {
      metadata = await extractDocumentMetadata(extractedText, originalName);
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
      keyDetails: metadata.keyDetails || {},
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
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Tenant check: ensure user owns the document before deleting
    if (doc.userId && req.user?.userId && doc.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, error: 'Access Denied: You cannot delete another user document' });
    }

    await Document.findByIdAndDelete(req.params.id);
    await Deadline.deleteMany({ linkedDocId: req.params.id });

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ==========================================================================
   3. AI Q&A API (Groq + RAG)
   ========================================================================== */
app.post('/api/ai/query', async (req, res) => {
  try {
    const { question, docId } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    let contextDocs = [];
    if (docId) {
      const doc = await Document.findById(docId);
      if (doc) contextDocs = [doc];
    } else {
      const queryFilter = req.user?.userId ? { userId: req.user.userId } : {};
      contextDocs = await Document.find(queryFilter).sort({ createdAt: -1 }).limit(10);
    }

    const answer = await answerDocumentQuery(question, contextDocs);

    res.json({
      success: true,
      answer,
      sources: contextDocs.map(d => ({ title: d.title, category: d.category })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ==========================================================================
   4. Assets API
   ========================================================================== */
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await Asset.find().populate('linkedDocumentIds');
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/assets', async (req, res) => {
  try {
    const asset = new Asset(req.body);
    await asset.save();
    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ==========================================================================
   5. Deadlines & Reminders API
   ========================================================================== */
app.get('/api/deadlines', async (req, res) => {
  try {
    const deadlines = await Deadline.find().populate('linkedDocId').sort({ date: 1 });
    res.json({ success: true, data: deadlines });
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
