/**
 * lib/ai/receipt-parser.ts
 * Modular AI OCR engine untuk scan struk, screenshot mutasi, bukti transfer.
 * Menggunakan Gemini REST API dengan fallback model otomatis.
 */

export interface ParsedReceiptData {
  amount: number | null;
  type: "EXPENSE" | "INCOME";
  note: string | null;
  merchantName: string | null;
  categoryName: string | null;
  walletName: string | null;
  date: string | null; // ISO YYYY-MM-DD
  confidence: number;
  items?: Array<{ name: string; price: number; qty?: number }>;
}

export interface WorkspaceContext {
  categories: Array<{ id: string; name: string }>;
  wallets: Array<{ id: string; name: string }>;
}

// ── Prompt Builder ─────────────────────────────────────────────────────────────
function buildPrompt(workspaceContext?: WorkspaceContext): string {
  const categoryList = workspaceContext?.categories?.map((c) => c.name).join(", ") || "-";
  const walletList = workspaceContext?.wallets?.map((w) => w.name).join(", ") || "-";

  return `You are a financial AI assistant for Dwitku app. Analyze this receipt/payment screenshot/bank statement image and extract transaction data.

The image can be any of:
- Physical store receipt (minimarket, restaurant, cafe)
- Bank transfer screenshot (BCA, Mandiri, BRI, BNI, Jago, SeaBank)
- E-wallet transaction (GoPay, OVO, ShopeePay, DANA)
- POS cashier receipt or invoice
- Online shopping receipt (Shopee, Tokopedia, etc.)
- Any payment proof

Available categories in user's workspace: [${categoryList}]
Available wallets/payment methods: [${walletList}]

Extract and return ONLY a valid JSON object (no markdown, no explanation, no code block):
{
  "amount": <integer, total amount paid in the local currency, numbers only without currency symbols or separators>,
  "type": "EXPENSE" or "INCOME",
  "note": "<short description, e.g. Belanja Indomaret / Kopi Kenangan 2 Cup / Transfer BCA>",
  "merchantName": "<store or merchant name if visible>",
  "categoryName": "<best matching category from the list above, or null if none match>",
  "walletName": "<best matching wallet from the list above based on payment method shown, or null if none match>",
  "date": "<transaction date in YYYY-MM-DD format if visible, otherwise null>",
  "confidence": <number between 0.0 and 1.0 indicating how confident you are>,
  "items": [
    {"name": "<item name>", "price": <price as integer>, "qty": <quantity as integer>}
  ]
}

Rules:
- amount MUST be an integer (no decimals, no Rp, no dots or commas)
- If you cannot clearly read the amount, set amount to null
- type is almost always EXPENSE unless this is clearly an incoming transfer/payment received
- Return ONLY the JSON object, nothing else`;
}

// ── Base64 Extractor ───────────────────────────────────────────────────────────
function extractBase64(imageBase64: string): { data: string; mimeType: string } {
  // Support: data:image/jpeg;base64,... OR raw base64
  const match = imageBase64.match(/^data:([\w\/+]+);base64,(.+)$/s);
  if (match) {
    return { mimeType: match[1] || "image/jpeg", data: match[2].replace(/\s/g, "") };
  }
  // Raw base64 (strip any whitespace)
  return { mimeType: "image/jpeg", data: imageBase64.replace(/\s/g, "") };
}

// ── JSON Extractor (robust) ────────────────────────────────────────────────────
function extractJSON(text: string): any {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(text.trim());
  } catch {}

  // Strategy 2: Strip markdown fences
  const fenceStripped = text
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();
  try {
    return JSON.parse(fenceStripped);
  } catch {}

  // Strategy 3: Find first {...} block
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  // Strategy 4: Find last {...} block (sometimes there's preamble text)
  const allBlocks = [...text.matchAll(/\{[\s\S]*?\}/g)];
  for (let i = allBlocks.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(allBlocks[i][0]);
      if (obj && typeof obj === "object") return obj;
    } catch {}
  }

  throw new Error("AI menghasilkan respons yang tidak dapat diproses. Coba gambar yang lebih jelas.");
}

// ── Gemini REST Caller ─────────────────────────────────────────────────────────
async function callGeminiREST(
  base64Data: string,
  mimeType: string,
  prompt: string,
  modelName: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi. Tambahkan ke file .env dan restart server."
    );
  }

  // Encode API key untuk keamanan URL
  const encodedKey = encodeURIComponent(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodedKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
      // Tidak pakai responseMimeType agar kompatibel semua model
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errMsg = `Gemini API error ${response.status}`;
    try {
      const errJson = JSON.parse(responseText);
      errMsg = errJson?.error?.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  let json: any;
  try {
    json = JSON.parse(responseText);
  } catch {
    throw new Error("Gagal membaca respons dari Gemini API.");
  }

  // Ekstrak teks dari response candidates
  const candidates = json?.candidates;
  if (!candidates || candidates.length === 0) {
    const blockReason = json?.promptFeedback?.blockReason;
    if (blockReason) {
      throw new Error(`Gambar diblokir oleh safety filter: ${blockReason}`);
    }
    throw new Error("Gemini tidak mengembalikan hasil. Coba gambar yang lebih jelas.");
  }

  const finishReason = candidates[0]?.finishReason;
  if (finishReason === "SAFETY") {
    throw new Error("Gambar diblokir safety filter. Coba gambar struk yang berbeda.");
  }

  const text = candidates[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini tidak menghasilkan teks. Model mungkin tidak mendukung gambar ini.");
  }

  return text;
}

// ── OpenAI REST Caller ─────────────────────────────────────────────────────────
async function callOpenAIREST(
  base64Data: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_OCR_MODEL || "gpt-4o-mini";

  if (!apiKey) throw new Error("OPENAI_API_KEY belum dikonfigurasi di .env.");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: "high",
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI API error ${response.status}`);
  }

  const json = await response.json();
  return json?.choices?.[0]?.message?.content || "";
}

// ── Main Parser ────────────────────────────────────────────────────────────────
export async function parseReceiptWithAI(
  imageBase64: string,
  mimeTypeHint: string = "image/jpeg",
  workspaceContext?: WorkspaceContext
): Promise<ParsedReceiptData> {
  const provider = (process.env.AI_OCR_PROVIDER || "gemini").toLowerCase();
  const prompt = buildPrompt(workspaceContext);

  const { data: cleanBase64, mimeType: detectedMime } = extractBase64(imageBase64);
  const finalMime = mimeTypeHint && mimeTypeHint !== "image/jpeg"
    ? mimeTypeHint
    : detectedMime;

  let rawText = "";

  if (provider === "openai") {
    rawText = await callOpenAIREST(cleanBase64, finalMime, prompt);
  } else {
    // Gemini dengan fallback model otomatis
    const preferredModel = process.env.GEMINI_OCR_MODEL || "gemini-1.5-flash";
    // Daftar model fallback jika model utama gagal
    const modelFallbacks = [
      preferredModel,
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
    ].filter((v, i, a) => a.indexOf(v) === i); // unique

    let lastError: Error | null = null;

    for (const model of modelFallbacks) {
      try {
        rawText = await callGeminiREST(cleanBase64, finalMime, prompt, model);
        break; // Berhasil, keluar dari loop
      } catch (err: any) {
        lastError = err;
        // Jika error bukan soal model (e.g. API key invalid), hentikan retry
        const msg: string = err?.message || "";
        if (
          msg.includes("API_KEY") ||
          msg.includes("API key") ||
          msg.includes("belum dikonfigurasi") ||
          msg.includes("PERMISSION_DENIED") ||
          msg.includes("UNAUTHENTICATED")
        ) {
          break;
        }
        // Lanjut ke model berikutnya
        console.warn(`[OCR] Model ${model} gagal: ${msg}, mencoba model berikutnya...`);
        continue;
      }
    }

    if (!rawText && lastError) {
      throw new Error(lastError.message || "Semua model Gemini gagal memproses gambar ini.");
    }
  }

  // Parse JSON dari respons AI
  const parsed = extractJSON(rawText);

  return {
    amount: parsed.amount != null && !isNaN(Number(parsed.amount))
      ? Math.round(Number(parsed.amount))
      : null,
    type: parsed.type === "INCOME" ? "INCOME" : "EXPENSE",
    note: parsed.note || parsed.merchantName || null,
    merchantName: parsed.merchantName || null,
    categoryName: parsed.categoryName || null,
    walletName: parsed.walletName || null,
    date: parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
    items: Array.isArray(parsed.items) ? parsed.items : [],
  };
}
