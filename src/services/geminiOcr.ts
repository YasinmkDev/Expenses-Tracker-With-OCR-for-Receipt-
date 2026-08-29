import { executeRealOCR, ScannedReceiptResult } from './ocrEngine';

export { ScannedReceiptResult };

/**
 * High-accuracy multi-strategy Receipt OCR Parser
 */
export async function parseReceiptWithGemini(
  base64Image: string,
  _apiKey?: string
): Promise<ScannedReceiptResult> {
  return await executeRealOCR(base64Image);
}
