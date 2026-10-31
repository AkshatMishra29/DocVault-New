import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { Document } from '../documents/document.model.js';
import { Asset } from '../assets/asset.model.js';
import { answerDocumentQuery } from '../../services/ai/groqService.js';
import { generateEmbedding } from '../../services/ai/huggingFaceService.js';

const router = Router();

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// POST /api/ai/query - Contextual AI Q&A across user vault
router.post('/query', requireAuth, async (req, res) => {
  try {
    const { question, docId } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    let documents = [];

    if (docId) {
      const doc = await Document.findOne({ _id: docId, userId: req.user.userId }).select('-fileData');
      if (doc) documents.push(doc);
    } else {
      documents = await Document.find({ userId: req.user.userId }).select('-fileData');

      // Rank via semantic embeddings if query vector is generated
      try {
        const queryVector = await generateEmbedding(question);
        if (queryVector && queryVector.length > 0) {
          documents = documents
            .map(d => ({
              doc: d,
              score: d.embedding && d.embedding.length > 0 ? cosineSimilarity(queryVector, d.embedding) : 0,
            }))
            .sort((a, b) => b.score - a.score)
            .map(item => item.doc);
        }
      } catch (err) {
        console.warn('[AI Assistant] Semantic vector search skipped, falling back to top docs:', err.message);
      }
    }

    const assets = await Asset.find({ userId: req.user.userId }).catch(() => []);

    const rawAnswer = await answerDocumentQuery(question, documents, assets);

    // Format response cleanly for frontend
    const answer = typeof rawAnswer === 'string' ? rawAnswer : (rawAnswer?.answer || JSON.stringify(rawAnswer));
    const referencedDocIds = documents.map(d => d._id);

    res.json({
      success: true,
      data: {
        answer,
        confidence: documents.length > 0 ? 'high' : 'low',
        referencedDocIds,
        actionItem: null,
      },
    });
  } catch (err) {
    console.error('[AI Assistant Query Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
