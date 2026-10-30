/**
 * DocVault Central Copywriting & Interface Text Catalog
 * Professional English microcopy, product messaging, and FAQ data.
 */

export const brandCopy = {
  name: "DocVault",
  tagline: "Your documents. One intelligent vault.",
  subheadline: "Securely organize, manage and understand your important documents. Never miss an expiry date again.",
  primaryCta: "Get Started",
  secondaryCta: "Explore Features",
  supportingTagline: "Everything important, organized in one place."
};

export const featuresCopy = [
  {
    id: "vault",
    title: "Secure Document Vault",
    description: "Keep your important documents organized in one secure, accessible place.",
    detail: "Strict tenant isolation ensures your sensitive contracts, IDs, and financial files remain private and tamper-evident."
  },
  {
    id: "ai",
    title: "AI Document Assistant",
    description: "Ask questions about your documents and discover important information faster.",
    detail: "Zero-hallucination bounded RAG answers queries exclusively using your verified policy and warranty clauses."
  },
  {
    id: "deadlines",
    title: "Smart Expiry Tracking",
    description: "Keep track of important renewal dates, warranties and insurance deadlines.",
    detail: "Automated countdown timers and RFC-5545 iCalendar synchronization ensure you never incur late penalties."
  },
  {
    id: "ocr",
    title: "Intelligent Hybrid OCR",
    description: "Extract useful information from scanned documents, images and PDFs.",
    detail: "Combines local Sharp image conditioning, Tesseract.js, and Groq LPU multimodal vision for degraded scans."
  }
];

export const howItWorksCopy = [
  {
    step: "01",
    title: "Upload",
    description: "Add your PDFs, scans, photos, and important documents with a simple drag-and-drop."
  },
  {
    step: "02",
    title: "Extract",
    description: "DocVault processes files through local OCR and Groq AI to structure key policy details."
  },
  {
    step: "03",
    title: "Organize",
    description: "Documents are categorized into Insurance, Identity, Appliances, Property, and Medical vaults."
  },
  {
    step: "04",
    title: "Discover",
    description: "Ask questions, track upcoming renewal deadlines, and sync reminders with your personal calendar."
  }
];

export const faqCopy = [
  {
    q: "What is DocVault?",
    a: "DocVault is an intelligent personal document management platform that organizes, extracts key details, and tracks deadlines across your insurance policies, identity proofs, invoices, and warranties."
  },
  {
    q: "Which document formats are supported?",
    a: "DocVault supports PDF documents (both native digital PDFs and scanned image-based PDFs) as well as direct image snapshots including PNG, JPG, JPEG, and WEBP formats up to 25 MB."
  },
  {
    q: "How does document extraction work?",
    a: "When you upload a file, DocVault runs image conditioning through Sharp, transcribes text locally via Tesseract.js, and uses Groq LPU acceleration (Qwen 3.8 27B) to extract structured fields like Policy Numbers, Sum Insured, and Expiration Dates."
  },
  {
    q: "How does the AI assistant work?",
    a: "The Ask AI assistant is a bounded Retrieval-Augmented Generation (RAG) copilot. It searches exclusively within your personal vault documents using semantic embeddings, providing grounded answers with exact document citations."
  },
  {
    q: "Can I track insurance and warranty expiry?",
    a: "Yes. When an expiry date is detected during upload, DocVault automatically creates a deadline record. You can subscribe to these deadlines via a standard RFC-5545 iCalendar (.ics) feed directly in Google Calendar, Apple Calendar, or Outlook."
  },
  {
    q: "How does Vault PIN verification work?",
    a: "DocVault implements two-step authentication: your account password verifies identity, while a secondary 4-to-6 digit numeric PIN unlocks your active session, defending against unauthorized physical access on shared devices."
  },
  {
    q: "Where are uploaded documents stored?",
    a: "Documents are stored securely with strict tenant isolation, binding all queries to your unique user account ID. Binary document buffers are preserved in dedicated storage with tamper-evident audit logging."
  },
  {
    q: "Can I export my entire vault?",
    a: "Yes. You can export a full, portable JSON backup of your document inventory, asset registry, and deadline schedule at any time from the Settings / More panel."
  }
];

