import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import { config } from './config.js';
import { uploadToFirebase, deleteFromFirebase } from './services/firebaseService.js';
import { uploadToR2, deleteFromR2, isR2Configured } from './services/cloudflareR2Service.js';
import { extractDocumentMetadata, answerDocumentQuery } from './services/groqService.js';
import { generateEmbedding } from './services/huggingFaceService.js';
import { Document, Asset, Deadline, User, AuditLog } from './models/index.js';

// Unified Storage helper (Cloudflare R2 preferred, Firebase as fallback)
async function uploadFile(buffer, destinationPath, mimetype) {
  if (isR2Configured()) {
    return await uploadToR2(buffer, destinationPath, mimetype);
  }
  return await uploadToFirebase(buffer, destinationPath, mimetype);
}

async function deleteFile(storagePath) {
  if (isR2Configured()) {
    return await deleteFromR2(storagePath);
  }
  return await deleteFromFirebase(storagePath);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
      storage: isR2Configured() ? 'Cloudflare R2' : Boolean(config.firebase.storageBucket) ? 'Firebase' : 'None',
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

    const docs = await Document.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/documents/:id - Single document details
app.get('/api/documents/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
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

    // 1. Upload to Object Storage (Cloudflare R2 or Firebase)
    const timestamp = Date.now();
    const destinationPath = `documents/${timestamp}_${originalName}`;
    const { storagePath, downloadUrl } = await uploadFile(buffer, destinationPath, mimetype);

    // 2. Extract metadata via Groq
    const metadata = await extractDocumentMetadata('', originalName);

    // 3. Generate embedding via Hugging Face
    const textToEmbed = `${metadata.title} ${metadata.summary} ${metadata.tags.join(' ')}`;
    const embedding = await generateEmbedding(textToEmbed);

    // 4. Save to MongoDB
    const doc = new Document({
      title: metadata.title || originalName,
      originalName,
      category: metadata.category || req.body.category || 'Other',
      format: mimetype.includes('pdf') ? 'PDF' : 'Image',
      sizeBytes,
      fileSizeFormatted,
      storagePath,
      downloadUrl,
      summary: metadata.summary,
      keyDetails: metadata.keyDetails || {},
      tags: metadata.tags || [],
      expiryDate: metadata.expiryDate,
      isExpiringSoon: Boolean(metadata.expiryDate),
      embedding,
    });

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

// DELETE /api/documents/:id - Delete document from MongoDB & Firebase
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    await deleteFile(doc.storagePath);
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
      contextDocs = await Document.find({}).limit(5);
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
