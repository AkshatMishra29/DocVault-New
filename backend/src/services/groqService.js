import Groq from 'groq-sdk';
import { config } from '../config.js';

const groq = new Groq({
  apiKey: config.groq.apiKey,
});

/**
 * Extract structured metadata, entity fields, and expiry dates from document text
 */
export async function extractDocumentMetadata(rawText, filename) {
  const prompt = `You are the DocVault AI Extraction Engine.
Analyze the following document text and return ONLY a valid JSON object (no markdown, no backticks, no commentary).

Extract the following fields:
{
  "title": "A short, descriptive title for this document (e.g., 'Honda City Comprehensive Insurance Policy')",
  "category": "One of: ['Insurance', 'Appliances', 'Identity', 'Property', 'Medical', 'Other']",
  "summary": "A concise 2-3 sentence executive summary explaining what this document is and any critical policy numbers or conditions.",
  "expiryDate": "YYYY-MM-DD format if an expiration, renewal, or warranty end date is present, otherwise null",
  "keyDetails": {
    "Key Name (e.g. Policy Number, Sum Insured, Serial Number, Premium)": "Value"
  },
  "tags": ["array", "of", "3-5", "relevant", "search", "keywords"]
}

Filename: ${filename}
Document Text:
${rawText ? rawText.slice(0, 4000) : 'No OCR text available. Infer from filename.'}
`;

  try {
    const response = await groq.chat.completions.create({
      model: config.groq.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed;
  } catch (err) {
    console.error('[Groq] Metadata extraction failed:', err.message);
    return {
      title: filename.replace(/\.[^/.]+$/, ''),
      category: 'Other',
      summary: 'Uploaded document stored securely in your encrypted DocVault.',
      expiryDate: null,
      keyDetails: { 'File Name': filename },
      tags: ['Document', 'Vault'],
    };
  }
}

/**
 * Answer questions based on retrieved document context (RAG Q&A)
 */
export async function answerDocumentQuery(question, contextDocs) {
  const contextString = contextDocs.map((doc, idx) => `
[Document ${idx + 1}]: "${doc.title}" (Category: ${doc.category})
Summary: ${doc.summary}
Key Details: ${JSON.stringify(doc.keyDetails)}
`).join('\n---\n');

  const prompt = `You are the DocVault AI Assistant.
Answer the user's question directly, accurately, and politely using ONLY the provided document context below.
If the documents don't provide the answer, say "I cannot find that in your currently uploaded documents."
Always include specific numbers, dates, and name the source document when answering.

CONTEXT DOCUMENTS:
${contextString}

USER QUESTION:
${question}
`;

  try {
    const response = await groq.chat.completions.create({
      model: config.groq.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('[Groq] Chat query failed:', err.message);
    throw err;
  }
}
