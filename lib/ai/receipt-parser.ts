import { GoogleGenAI } from "@google/genai";

export interface ParsedReceiptData {
  amount: number | null;
  type: "EXPENSE" | "INCOME";
  note: string | null;
  merchantName: string | null;
  categoryName: string | null;
  walletName: string | null;
  date: string | null; // ISO YYYY-MM-DD
  confidence: number;
  rawText?: string;
  items?: Array<{ name: string; price: number; qty?: number }>;
}

export interface WorkspaceContext {
  categories: Array<{ id: string; name: string }>;
  wallets: Array<{ id: string; name: string }>;
}

/**
 * Modular AI OCR Parser Engine
 * Mendukung Gemini (Flash/Pro), OpenAI, Groq, atau fallback engine.
 */
export async function parseReceiptWithAI(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  workspaceContext?: WorkspaceContext
): Promise<ParsedReceiptData> {
  const provider = process.env.AI_OCR_PROVIDER || "gemini";
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!geminiApiKey && provider === "gemini") {
    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi di file .env. Dapatkan API key gratis di https://aistudio.google.com/"
    );
  }

  const categoryListStr = workspaceContext?.categories?.map((c) => c.name).join(", ") || "";
  const walletListStr = workspaceContext?.wallets?.map((w) => w.name).join(", ") || "";

  const systemPrompt = `Anda adalah asisten AI finansial pintar dari Dwitku yang ahli menganalisis struk belanja fisik, nota restoran, screenshot mutasi/transfer m-banking (BCA, Mandiri, BRI, BNI, Jago, dll), screenshot e-wallet (GoPay, OVO, ShopeePay, DANA), struk kasir minimarket (Indomaret, Alfamart), dan faktur pembayaran.

Tugas Anda: Analisis gambar struk/screenshot ini dan ekstrak informasinya ke dalam format JSON yang valid.

Kategori yang tersedia di akun pengguna: [${categoryListStr}]
Dompet/Metode pembayaran yang tersedia: [${walletListStr}]

Instruksi format JSON:
{
  "amount": <number bulat tanpa titik/koma/Rp, total transaksi final yang dibayarkan>,
  "type": "EXPENSE" | "INCOME" (mayoritas adalah EXPENSE kecuali struk/screenshot adalah bukti dana masuk/transfer diterima),
  "note": "<string catatan ringkas, cth: 'Belanja Indomaret', 'Kopi Kenangan 2 Cup', 'Makan Siang di Solaria'>",
  "merchantName": "<string nama toko / merchant / nama pengirim>",
  "categoryName": "<pilih salah satu kategori yang paling cocok dari daftar kategori di atas, atau null jika tidak ada yang cocok>",
  "walletName": "<pilih salah satu dompet yang paling cocok dari daftar dompet di atas, atau null jika tidak ada>",
  "date": "<tanggal transaksi dalam format YYYY-MM-DD jika terbaca di struk, atau null jika tidak ada>",
  "confidence": <angka 0.0 - 1.0 tingkat keyakinan AI>,
  "items": [
    { "name": "<nama item barang/makanan>", "price": <harga satuan/total>, "qty": <jumlah item jika ada> }
  ]
}

PENTING:
- Kembalikan HANYA format JSON murni tanpa markdown pembungkus (\`\`\`json ... \`\`\`).
- Jika nominal tidak terbaca jelas, set amount ke null.
`;

  try {
    if (provider === "gemini") {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const modelName = process.env.GEMINI_OCR_MODEL || "gemini-2.5-flash";

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType || "image/jpeg",
                },
              },
              {
                text: systemPrompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const responseText = response.text?.trim() || "";
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        amount: parsed.amount ? Number(parsed.amount) : null,
        type: parsed.type === "INCOME" ? "INCOME" : "EXPENSE",
        note: parsed.note || parsed.merchantName || "Transaksi Scan Struk",
        merchantName: parsed.merchantName || null,
        categoryName: parsed.categoryName || null,
        walletName: parsed.walletName || null,
        date: parsed.date || null,
        confidence: parsed.confidence || 0.9,
        items: parsed.items || [],
      };
    }

    // Fallback jika provider lain disiapkan di masa depan
    throw new Error(`Provider AI OCR '${provider}' belum diaktifkan.`);
  } catch (error: any) {
    console.error("AI Receipt OCR Error:", error);
    throw new Error(error?.message || "Gagal memproses gambar struk dengan AI.");
  }
}
