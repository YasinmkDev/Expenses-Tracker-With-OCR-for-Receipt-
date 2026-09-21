const fs = require('node:fs');
const path = require('node:path');

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const name = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!process.env[name]) process.env[name] = value;
  }
}

async function main() {
  loadEnvFile();

  const apiKey = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY;
  const imagePath = path.resolve(__dirname, '..', 'assets', 'image.png');

  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_OCR_SPACE_API_KEY in .env');
  }
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  const imageBase64 = fs.readFileSync(imagePath).toString('base64');
  const form = new FormData();
  form.append('base64Image', `data:image/png;base64,${imageBase64}`);
  form.append('language', 'eng');
  form.append('isOverlayRequired', 'false');
  form.append('OCREngine', '2');
  form.append('apikey', apiKey);

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: form,
  });
  const rawResponse = await response.text();

  console.log(`HTTP status: ${response.status}`);
  console.log('\n--- Raw OCR.space response ---');
  try {
    console.log(JSON.stringify(JSON.parse(rawResponse), null, 2));
  } catch {
    console.log(rawResponse);
  }

  if (!response.ok) process.exitCode = 1;

  try {
    const result = JSON.parse(rawResponse);
    const text = result?.ParsedResults?.map((item) => item.ParsedText || '').join('\n').trim();
    console.log('\n--- Extracted text ---');
    console.log(text || '(No text extracted)');
  } catch {
    console.log('\nCould not parse OCR.space response as JSON.');
  }
}

main().catch((error) => {
  console.error(`OCR test failed: ${error.message}`);
  process.exitCode = 1;
});
