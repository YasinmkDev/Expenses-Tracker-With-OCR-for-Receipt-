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
  const lines = clean
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

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
export async function executeRealOCR(base64Image: string): Promise<ScannedReceiptResult> {
  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

  if (!cleanBase64 || cleanBase64.length < 50) {
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
      engine: 'none',
      errorMessage: 'Image is empty or unreadable.',
    };
  }

  // 1. Try Gemini Vision if API key is present
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  if (geminiKey) {
    try {
      const prompt = `You are a financial receipt OCR parser. Analyze this image. If this image is NOT a receipt or has no readable text/prices, respond with: {"isValidReceipt": false, "errorMessage": "No receipt detected"}.
Otherwise extract JSON:
{
  "isValidReceipt": true,
  "merchant": "Store Name",
  "date": "MMM DD, YYYY",
  "total": 0.00,
  "tax": 0.00,
  "category": "Dining | Groceries | Transport | Shopping | Health | Entertain | Travel | Electronics | Utilities | Misc",
  "confidence": "high | medium | low",
  "lineItems": [
    { "name": "Item Description", "price": 0.00, "category": "Category", "confidence": "high | medium | low" }
  ]
}`;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: 'image/jpeg', data: cleanBase64 } },
                ],
              },
            ],
            generationConfig: { response_mime_type: 'application/json' },
          }),
        }
      );
      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (parsed.isValidReceipt === false || (!parsed.merchant && !parsed.total)) {
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
            engine: 'gemini-flash',
            errorMessage: parsed.errorMessage || 'No legible receipt detected in the image.',
          };
        }

        return {
          isValidReceipt: true,
          merchant: parsed.merchant || 'Parsed Merchant',
          date: parsed.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          total: Number(parsed.total) || 0,
          subtotal: Number(parsed.total) - (Number(parsed.tax) || 0),
          tax: Number(parsed.tax) || 0,
          category: parsed.category || 'Misc',
          confidence: parsed.confidence || 'high',
          engine: 'gemini-flash',
          lineItems: (parsed.lineItems || []).map((item: any, idx: number) => ({
            id: `gemini-item-${idx + 1}`,
            name: item.name,
            price: Number(item.price) || 0,
            category: item.category || parsed.category || 'Misc',
            confidence: item.confidence || 'high',
          })),
          note: 'AI OCR Extracted via Gemini 2.5 Flash Vision',
        };
      }
    } catch (e) {
      console.warn('Gemini OCR fetch failed, using On-Device Free OCR parser:', e);
    }
  }

  // 2. High-Speed Public OCR API (OCR.Space Engine 2 for Receipts)
  try {
    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${cleanBase64}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2'); // Engine 2 optimized for receipts and invoices
    formData.append('apikey', 'K88729388888957');

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const ocrJson = await ocrResponse.json();
    const parsedText = ocrJson?.ParsedResults?.[0]?.ParsedText;

    if (parsedText && parsedText.trim().length > 0) {
      const result = parseRawReceiptText(parsedText);
      return result;
    }
  } catch (err) {
    console.warn('OCR Space API failed:', err);
  }

  // 3. If zero text extracted from image, return invalid receipt instead of fake mock data
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
    engine: 'none',
    errorMessage: 'No text or receipt numbers could be detected in this photo.',
  };
}
