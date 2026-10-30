import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

/**
 * OCR Service for multi-format text extraction (PDFs, JPGs, PNGs)
 * Implements privacy-first local OCR with preprocessing via Sharp.
 */

export async function extractTextFromPDF(buffer) {
  try {
    const parser = new PDFParse();
    const parsed = await parser.parse(buffer);
    return parsed.text ? parsed.text.trim() : '';
  } catch (err) {
    console.warn('[OCR Service] PDF Parse error:', err.message);
    return '';
  }
}

export async function extractTextFromImage(buffer) {
  try {
    // Preprocess image with Sharp for optimal Tesseract OCR accuracy
    const preprocessedBuffer = await sharp(buffer)
      .greyscale()
      .normalize()
      .sharpen()
      .toBuffer();

    const { data: { text } } = await Tesseract.recognize(preprocessedBuffer, 'eng');
    return text ? text.trim() : '';
  } catch (err) {
    console.warn('[OCR Service] Tesseract image OCR error:', err.message);
    return '';
  }
}

export async function convertPdfToImages(buffer) {
  try {
    const { default: pdfImgConvert } = await import('pdf-img-convert');
    return await pdfImgConvert.convert(buffer, {
      width: 1600,
      page_numbers: [1, 2],
    });
  } catch (err) {
    console.warn('[OCR Service] pdf-img-convert unavailable:', err.message);
    return null;
  }
}

