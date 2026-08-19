import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const DEFAULT_FROM_EMAIL =
  process.env.EMAIL_FROM || "Dwitku <no-reply@dwitku.my.id>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend] RESEND_API_KEY tidak terdefinisi di file .env");
    return {
      error: "RESEND_API_KEY belum dikonfigurasi. Mohon periksa file .env",
    };
  }

  try {
    const from = DEFAULT_FROM_EMAIL;
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Resend] Error saat mengirim email dari", from, ":", error);

      // Jika gagal karena domain belum diverifikasi di Resend, coba fallback ke domain default sandbox
      if (
        (error.message?.toLowerCase().includes("domain") ||
          error.name === "validation_error") &&
        !from.includes("resend.dev")
      ) {
        console.warn("[Resend] Mencoba kirim ulang via onboarding@resend.dev...");
        const fallback = await resend.emails.send({
          from: "Dwitku <onboarding@resend.dev>",
          to,
          subject,
          html,
        });

        if (!fallback.error) {
          return { success: true, data: fallback.data };
        }
      }

      return { error: error.message || "Gagal mengirim email." };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend] Exception:", err);
    return { error: err.message || "Terjadi kesalahan saat mengirim email." };
  }
}
