import * as FileSystem from 'expo-file-system/legacy';
import { CategoryType, LineItem } from '../types';

export interface ScannedReceiptResult {
  isValidReceipt: boolean;
  merchant: string;
  date: string;
  total: number;
  tax: number;
  subtotal: number;
  category: CategoryType | string;
  lineItems: LineItem[];
  confidence: 'high' | 'medium' | 'low';
  engine: 'mlkit-vision' | 'gemini-flash' | 'free-ocr-engine' | 'none';
  errorMessage?: string;
  note?: string;
  rawText?: string;
}

const DEFAULT_DATE = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function invalidReceipt(errorMessage: string, rawText?: string): ScannedReceiptResult {
  return {
    isValidReceipt: false,
    merchant: '',
    date: DEFAULT_DATE(),
    total: 0,
    tax: 0,
    subtotal: 0,
    category: 'Misc',
    lineItems: [],
    confidence: 'low',
    engine: 'none',
    errorMessage,
    rawText,
  };
}

const SUPPORTED_CATEGORIES: CategoryType[] = [
  'Dining', 'Groceries', 'Transport', 'Shopping', 'Health', 'Entertain', 'Travel', 'Electronics', 'Utilities', 'Misc',
];

function normalizeCategory(value: unknown, context: string): CategoryType {
  const category = String(value || '').trim();
  const supported = SUPPORTED_CATEGORIES.find((item) => item.toLowerCase() === category.toLowerCase());
  return supported || categorizeText(context);
}

function normalizeConfidence(value: unknown): 'high' | 'medium' | 'low' {
  if (typeof value === 'number') return value >= 0.85 ? 'high' : value >= 0.6 ? 'medium' : 'low';
  return ['high', 'medium', 'low'].includes(String(value).toLowerCase())
    ? String(value).toLowerCase() as 'high' | 'medium' | 'low'
    : 'medium';
}

function parseGeminiResponse(value: unknown, rawText: string): ScannedReceiptResult | null {
  const responseText = typeof value === 'string'
    ? value
    : (value as any)?.choices?.[0]?.message?.content || (value as any)?.output || '';
  if (!responseText) return null;

  try {
    const jsonText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonText);
    if (parsed.isValidReceipt === false || (!parsed.merchant && !parsed.total)) {
      return null;
    }

    const itemContext = (parsed.lineItems || []).map((item: any) => item.name || item.description || '').join(' ');
    const category = normalizeCategory(parsed.category, `${parsed.merchant || parsed.supplier || parsed.vendor || ''} ${itemContext}`);
    const lineItems: LineItem[] = (Array.isArray(parsed.lineItems) ? parsed.lineItems : []).map((item: any, index: number) => ({
      id: `gemini-item-${index + 1}`,
      name: String(item.name || item.description || 'Receipt item'),
      price: Number(item.price ?? item.total ?? item.amount) || 0,
      category: normalizeCategory(item.category, `${item.name || item.description || ''} ${category}`),
      confidence: normalizeConfidence(item.confidence ?? parsed.confidence),
    }));
    const tax = Number(parsed.tax) || 0;
    const total = Number(parsed.total) || 0;
    const subtotal = Number(parsed.subtotal) || (total > tax ? total - tax : lineItems.reduce((sum, item) => sum + item.price, 0));

    return {
      isValidReceipt: true,
      merchant: String(parsed.merchant || parsed.supplier || parsed.vendor || parsed.billed_to_name || 'Receipt Merchant'),
      date: String(parsed.date || DEFAULT_DATE()),
      total: total || subtotal + tax,
      tax,
      subtotal,
      category,
      lineItems: lineItems.length ? lineItems : [{ id: 'gemini-item-1', name: 'Receipt total', price: total || subtotal, category, confidence: 'medium' }],
      confidence: normalizeConfidence(parsed.confidence),
      engine: 'gemini-flash',
      note: 'OCR.space text organized by Gemini AI',
      rawText,
    };
  } catch {
    return null;
  }
}

async function organizeReceiptWithGemini(rawText: string): Promise<ScannedReceiptResult | null> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.6-flash';
  const prompt = `You are a financial data extraction engine. Organize OCR text from a receipt or invoice into strict JSON only. An invoice is a valid expense document. Return isValidReceipt false only when there is no merchant and no monetary amount. Never invent missing values. Use this exact schema: {"isValidReceipt":true,"merchant":"string","date":"MMM DD, YYYY","subtotal":0,"tax":0,"total":0,"category":"Dining|Groceries|Transport|Shopping|Health|Entertain|Travel|Electronics|Utilities|Misc","confidence":"high|medium|low","lineItems":[{"name":"string","price":0,"category":"Dining|Groceries|Transport|Shopping|Health|Entertain|Travel|Electronics|Utilities|Misc","confidence":"high|medium|low"}]}. For invoices, use the supplier or company name as merchant, the issue date, and billed descriptions as line items. Keep numeric values as numbers.\n\nOCR TEXT:\n${rawText}`;

  try {
    const request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    };
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, request);
      if (response.ok) {
        const json = await response.json();
        const responseText = json?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('');
        return responseText ? parseGeminiResponse(responseText, rawText) : null;
      }
      if (![429, 500, 503].includes(response.status)) return null;
    }
    return null;
  } catch {
    return null;
  }
}

async function parseDocumentWithParseur(base64Image: string, imageUri?: string, mimeType = 'image/jpeg'): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_PARSEUR_API_KEY;
  const mailboxId = process.env.EXPO_PUBLIC_PARSEUR_MAILBOX_ID || '213962';
  if (!apiKey) throw new Error('Parseur API key is not configured.');

  const headers = { Authorization: `Token ${apiKey}` };
  let uploadFileUri = imageUri;
  let temporaryFileUri: string | undefined;
  if (!uploadFileUri) {
    temporaryFileUri = `${FileSystem.cacheDirectory}receipt-${Date.now()}.jpg`;
    await FileSystem.writeAsStringAsync(temporaryFileUri, base64Image, { encoding: FileSystem.EncodingType.Base64 });
    uploadFileUri = temporaryFileUri;
  }

  const uploadResponse = await FileSystem.uploadAsync(
    `https://api.parseur.com/parser/${mailboxId}/upload`,
    uploadFileUri,
    {
      headers,
      fieldName: 'file',
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      mimeType,
    }
  );
  if (temporaryFileUri) await FileSystem.deleteAsync(temporaryFileUri, { idempotent: true });
  if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
    throw new Error(`Parseur upload failed (${uploadResponse.status}).`);
  }

  const upload = JSON.parse(uploadResponse.body);
  const documentId = upload?.attachments?.[0]?.DocumentID;
  if (!documentId) throw new Error('Parseur accepted the upload but did not return a document ID.');

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const documentResponse = await fetch(`https://api.parseur.com/document/${documentId}`, { headers });
    if (!documentResponse.ok) throw new Error(`Parseur document lookup failed (${documentResponse.status}).`);
    const document = await documentResponse.json();
    if (document.status === 'PARSEDOK') {
      const result = typeof document.result === 'string' ? document.result : JSON.stringify(document.result || '');
      return [document.content, result].filter(Boolean).join('\n');
    }
    if (['PARSEDKO', 'QUOTAEXC', 'INVALID', 'EXPORTKO', 'TRANSKO'].includes(document.status)) {
      throw new Error(`Parseur processing failed with status ${document.status}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error('Parseur processing timed out.');
}

// Category keyword dictionary for automatic semantic categorization
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Dining: [
    'restaurant', 'cafe', 'coffee', 'espresso', 'bakery', 'bar', 'grill', 'bistro',
    'kitchen', 'pizza', 'burger', 'sushi', 'taco', 'deli', 'pasta', 'tea', 'latte',
    'starbucks', 'blue bottle', 'mcdonald', 'chipotle', 'subway', 'dinner', 'lunch',
    'breakfast', 'croissant', 'salad', 'beer', 'cocktail', 'wine'
  ],
  Groceries: [
    'market', 'grocery', 'supermarket', 'foods', 'trader joe', 'whole foods',
    'safeway', 'kroger', 'costco', 'walmart', 'produce', 'organic', 'milk',
    'bread', 'egg', 'cheese', 'fruit', 'vegetable', 'meat', 'avocado', 'yogurt',
    'butter', 'cereal', 'snack', 'water', 'juice'
  ],
  Transport: [
    'uber', 'lyft', 'taxi', 'cab', 'transit', 'metro', 'subway', 'train', 'bus',
    'gas', 'chevron', 'shell', 'exxon', 'bp', 'mobil', 'fuel', 'parking', 'toll',
    'airline', 'flight', 'delta', 'united', 'american air'
  ],
  Electronics: [
    'apple', 'best buy', 'micro center', 'samsung', 'dell', 'sony', 'lenovo',
    'hardware', 'tech', 'computer', 'cable', 'adapter', 'monitor', 'keyboard',
    'mouse', 'headphone', 'airpods', 'iphone', 'ipad', 'usb'
  ],
  Shopping: [
    'amazon', 'target', 'nordstrom', 'zara', 'h&m', 'uniqlo', 'nike', 'adidas',
    'clothing', 'apparel', 'shoes', 'boutique', 'store', 'retail', 'mall'
  ],
  Health: [
    'pharmacy', 'cvs', 'walgreens', 'clinic', 'hospital', 'dental', 'doctor',
    'medicine', 'vitamin', 'rx', 'prescription', 'optometry', 'health'
  ],
  Entertain: [
    'cinema', 'theatre', 'theater', 'movie', 'amc', 'regal', 'netflix', 'spotify',
    'ticket', 'concert', 'museum', 'bowling', 'arcade', 'game'
  ],
  Travel: [
    'hotel', 'marriott', 'hilton', 'hyatt', 'airbnb', 'hostel', 'resort',
    'booking', 'expedia', 'flight', 'luggage', 'car rental', 'hertz', 'enterprise'
  ],
  Utilities: [
    'electric', 'power', 'water', 'utility', 'internet', 'verizon', 'att',
    't-mobile', 'comcast', 'pge', 'edison', 'gas bill', 'sewer'
  ],
  Misc: ['general', 'service', 'fee', 'charge', 'other']
};

/**
 * Categorize a text string or item name into standard financial categories
 */
export function categorizeText(text: string): CategoryType {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return category as CategoryType;
      }
    }
  }
  return 'Misc';
}

/**
 * Parses raw text extracted from OCR into a structured financial receipt
 */
export function parseRawReceiptText(rawText: string): ScannedReceiptResult {
  const clean = rawText.trim();
  const sourceLines = clean
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const lines: string[] = [];
  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index];
    const nextLine = sourceLines[index + 1];
    if (
      nextLine &&
      /^(subtotal|sub total|sub-total|tax|vat|total|total due|balance due|amount due|grand total)\b/i.test(line) &&
      /[$€£¥]?\s*\d+[\d,]*[.,]\d{2}\s*$/.test(nextLine)
    ) {
      lines.push(`${line} ${nextLine}`);
      index += 1;
    } else {
      lines.push(line);
    }
  }

  // If there are fewer than 2 lines or total text length is under 8 characters, it's not a recognizable receipt
  if (lines.length < 2 || clean.length < 8) {
    return {
      isValidReceipt: false,
      merchant: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      total: 0,
      tax: 0,
      subtotal: 0,
      category: 'Misc',
      lineItems: [],
      confidence: 'low',
      engine: 'free-ocr-engine',
      errorMessage: 'No legible receipt text or structure detected in the image.',
      rawText,
    };
  }

  // 1. Merchant Detection: Header lines (top 1-3 lines)
  let merchant = '';
  for (let i = 0; i < Math.min(4, lines.length); i++) {
    const line = lines[i];
    if (
      !/^\d+[\/-]\d+/.test(line) &&
      !/^(tel|phone|fax|invoice|receipt|tax|date|order|cashier|st#)/i.test(line) &&
      line.length > 2 &&
      line.length < 40 &&
      !/\$\d+\.\d{2}/.test(line)
    ) {
      merchant = line.replace(/[^\w\s&'-]/g, '').trim();
      break;
    }
  }

  // 2. Date Detection
  let dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dateRegex = /(\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b)|(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b)/i;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      dateStr = match[0];
      break;
    }
  }

  // 3. Line Items & Amounts Extraction
  const lineItems: LineItem[] = [];
  let subtotal = 0;
  let tax = 0;
  let total = 0;

  // Regex to extract price at end of line
  const priceRegex = /([$€£¥]?\s*(\d{1,4}[.,]\d{2}))\s*$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Check for Total / Subtotal / Tax
    if (lower.includes('tax') || lower.includes('vat')) {
      const match = line.match(priceRegex);
      if (match) {
        tax = parseFloat(match[2].replace(',', '.'));
      }
      continue;
    }

    if (lower.includes('subtotal') || lower.includes('sub total') || lower.includes('sub-total')) {
      const match = line.match(priceRegex);
      if (match) {
        subtotal = parseFloat(match[2].replace(',', '.'));
      }
      continue;
    }

    if (lower.includes('total') || lower.includes('balance') || lower.includes('amount due') || lower.includes('grand total')) {
      const match = line.match(priceRegex);
      if (match) {
        total = parseFloat(match[2].replace(',', '.'));
      }
      continue;
    }

    // Normal line item extraction
    const match = line.match(priceRegex);
    if (match) {
      const priceVal = parseFloat(match[2].replace(',', '.'));
      const itemName = line.replace(priceRegex, '').replace(/[^\w\s&'-]/g, '').trim();

      if (
        itemName.length > 1 &&
        !/^(cash|change|visa|mastercard|amex|card|approved|auth|tip|discount|thank you)/i.test(itemName)
      ) {
        const itemCategory = categorizeText(itemName);
        lineItems.push({
          id: `ocr-item-${lineItems.length + 1}`,
          name: itemName,
          price: priceVal,
          category: itemCategory,
          confidence: 'high',
        });
      }
    }
  }

  // If no price or line items were found at all, check if raw text has any dollar amounts
  if (lineItems.length === 0 && total === 0 && subtotal === 0) {
    return {
      isValidReceipt: false,
      merchant: merchant || '',
      date: dateStr,
      total: 0,
      tax: 0,
      subtotal: 0,
      category: 'Misc',
      lineItems: [],
      confidence: 'low',
      engine: 'free-ocr-engine',
      errorMessage: 'Could not extract monetary amounts from the image.',
      rawText,
    };
  }

  if (lineItems.length > 0 && subtotal === 0) {
    subtotal = lineItems.reduce((sum, item) => sum + item.price, 0);
  }

  if (total === 0) {
    total = subtotal > 0 ? subtotal + tax : 0;
  }

  const overallCategory = categorizeText(merchant + ' ' + lineItems.map((i) => i.name).join(' '));

  return {
    isValidReceipt: true,
    merchant: merchant || 'Receipt Merchant',
    date: dateStr,
    total: total > 0 ? total : subtotal,
    subtotal,
    tax: tax,
    category: overallCategory,
    lineItems: lineItems.length > 0 ? lineItems : [
      {
        id: 'ocr-item-1',
        name: `${merchant || 'Scanned Expense'}`,
        price: total,
        category: overallCategory,
        confidence: 'medium',
      },
    ],
    confidence: lineItems.length > 0 ? 'high' : 'medium',
    engine: 'free-ocr-engine',
    note: `OCR Extracted • ${lineItems.length} Line Items`,
    rawText,
  };
}

/**
 * Execute real On-Device Image OCR or Free Cloud OCR API
 */
export async function executeRealOCR(base64Image: string, imageUri?: string, mimeType = 'image/jpeg'): Promise<ScannedReceiptResult> {
  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

  if (!cleanBase64 || cleanBase64.length < 50) {
    return invalidReceipt('Image is empty or unreadable.');
  }

  // Parseur performs document OCR and extraction; Gemini categorizes the returned text.
  try {
    const parsedText = await parseDocumentWithParseur(cleanBase64, imageUri, mimeType);
    const organized = await organizeReceiptWithGemini(parsedText);
    if (organized) return organized;

    const looksLikeExpenseDocument = /\b(receipt|invoice|subtotal|total due|amount due|balance due|tax)\b/i.test(parsedText)
      && /[$€£¥]\s*\d|\b\d+[.,]\d{2}\b/.test(parsedText);
    return looksLikeExpenseDocument
      ? parseRawReceiptText(parsedText)
      : invalidReceipt('Gemini could not organize Parseur data as an expense document.', parsedText);
  } catch (err) {
    console.warn('Parseur OCR failed:', err);
    return invalidReceipt(err instanceof Error ? err.message : 'Could not process the image with Parseur.');
  }
}
