/**
 * lib/ai/receipt-parser.ts
 * Modular AI OCR engine untuk scan struk, screenshot mutasi, bukti transfer.
 * Menggunakan Gemini REST API langsung (tanpa SDK) untuk stabilitas maksimal.
 * Provider didukung: gemini (default gratis), openai, groq
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

function buildPrompt(workspaceContext?: WorkspaceContext): string {
  const categoryList = workspaceContext?.categories?.map((c) => c.name).join(", ") || "-";
  const walletList = workspaceContext?.wallets?.map((w) => w.name).join(", ") || "-";

  return `Anda adalah asisten AI finansial pintar dari Dwitku yang ahli menganalisis:
- Struk belanja fisik minimarket (Indomaret, Alfamart)
- Nota restoran & kafe
- Screenshot mutasi m-banking (BCA, Mandiri, BRI, BNI, Jago)
- Screenshot e-wallet (GoPay, OVO, ShopeePay, DANA)
- Struk kasir POS & invoice

Kategori tersedia: [${categoryList}]
Dompet/Metode pembayaran tersedia: [${walletList}]

Ekstrak data transaksi dari gambar ini dan kembalikan HANYA JSON murni (tanpa markdown):
{
  "amount": <angka bulat total yang dibayar, tanpa Rp/titik/koma>,
  "type": "EXPENSE" atau "INCOME",
  "note": "<catatan singkat, misal: Belanja Indomaret / Kopi Kenangan 2 Cup>",
  "merchantName": "<nama toko atau merchant>",
  "categoryName": "<salah satu kategori dari daftar di atas, atau null>",
  "walletName": "<salah satu dompet dari daftar di atas, atau null>",
  "date": "<YYYY-MM-DD jika terbaca, atau null>",
  "confidence": <0.0 - 1.0>,
  "items": [{"name": "<item>", "price": <harga>, "qty": <jumlah>}]
}`;
}

function extractBase64(imageBase64: string): { data: string; mimeType: string } {
  // Bisa berupa data URL (data:image/jpeg;base64,...) atau raw base64
  const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  // Raw base64 tanpa prefix
  return { mimeType: "image/jpeg", data: imageBase64 };
}

async function callGeminiREST(
  base64Data: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_OCR_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi di .env. Dapatkan gratis di https://aistudio.google.com/"
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
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
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `Gemini API error ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson?.error?.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  const json = await response.json();
  const text: string =
    json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!text) {
    throw new Error("Gemini tidak mengembalikan hasil. Coba gambar yang lebih jelas.");
  }

  return text;
}

async function callOpenAIREST(
  base64Data: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
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
              image_url: { url: `data:${mimeType};base64,${base64Data}` },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI API error ${response.status}`);
  }

  const json = await response.json();
  return json?.choices?.[0]?.message?.content || "";
}

export async function parseReceiptWithAI(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  workspaceContext?: WorkspaceContext
): Promise<ParsedReceiptData> {
  const provider = (process.env.AI_OCR_PROVIDER || "gemini").toLowerCase();
  const prompt = buildPrompt(workspaceContext);

  // Ekstrak base64 murni
  const { data: cleanBase64, mimeType: detectedMime } = extractBase64(imageBase64);
  const finalMime = mimeType || detectedMime;

  let rawText = "";

  try {
    if (provider === "openai") {
      rawText = await callOpenAIREST(cleanBase64, finalMime, prompt);
    } else {
      // Default: Gemini (gratis)
      rawText = await callGeminiREST(cleanBase64, finalMime, prompt);
    }
  } catch (error: any) {
    throw new Error(error?.message || "Gagal menghubungi AI. Periksa konfigurasi API key.");
  }

  // Parse JSON result
  try {
    // Bersihkan jika ada markdown fence
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      amount: parsed.amount != null ? Number(parsed.amount) : null,
      type: parsed.type === "INCOME" ? "INCOME" : "EXPENSE",
      note: parsed.note || parsed.merchantName || null,
      merchantName: parsed.merchantName || null,
      categoryName: parsed.categoryName || null,
      walletName: parsed.walletName || null,
      date: parsed.date || null,
      confidence: Number(parsed.confidence) || 0.85,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    throw new Error(
      "AI berhasil membaca struk, namun gagal memproses hasilnya. Coba gambar yang lebih jelas."
    );
  }
}
