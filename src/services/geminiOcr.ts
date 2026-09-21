import { executeRealOCR, ScannedReceiptResult } from './ocrEngine';

export { ScannedReceiptResult };

/**
 * High-accuracy multi-strategy Receipt OCR Parser
 */
export async function parseReceiptWithGemini(
  base64Image: string,
  _apiKey?: string,
  imageUri?: string,
  mimeType?: string
): Promise<ScannedReceiptResult> {
  return await executeRealOCR(base64Image, imageUri, mimeType);
}
