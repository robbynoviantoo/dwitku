/** Template HTML email undangan workspace Dwitku */
export function buildInviteEmail({
    workspaceName,
    senderName,
    inviteLink,
    role,
    expiresAt,
}: {
    workspaceName: string;
    senderName: string;
    inviteLink: string;
    role: string;
    expiresAt: Date;
}) {
    const roleLabel: Record<string, string> = {
        OWNER: "Owner",
        EDITOR: "Editor",
        VIEWER: "Viewer",
    };
    const expiry = expiresAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Undangan Workspace Dwitku</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;">
                <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Dwitku</span>
              </div>
              <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:12px 0 0;">Pencatatan Keuangan Bersama</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                Kamu diundang ke workspace!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                <strong style="color:#3f3f46;">${senderName}</strong> mengundangmu untuk bergabung ke workspace
                <strong style="color:#3f3f46;">"${workspaceName}"</strong> di Dwitku dengan role
                <span style="background:#ede9fe;color:#5b21b6;font-weight:600;padding:2px 8px;border-radius:20px;font-size:13px;">${roleLabel[role] ?? role}</span>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}"
                       style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;letter-spacing:0.01em;">
                      Terima Undangan →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">
                      🔗 Atau salin link berikut:
                    </p>
                    <p style="margin:0;font-size:12px;color:#4f46e5;word-break:break-all;font-family:monospace;">
                      ${inviteLink}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#a1a1aa;">
                ⏳ Undangan ini berlaku hingga <strong>${expiry}</strong>.
                Jika kamu tidak merasa diundang, abaikan email ini.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;border-top:1px solid #f0f0f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                Email ini dikirim oleh Dwitku · Pencatatan Keuangan Bersama
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
/** Template HTML email verifikasi email Dwitku */
export function buildVerificationEmail({
    verificationLink,
    userName,
}: {
    verificationLink: string;
    userName: string;
}) {
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifikasi Email Dwitku</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#004C29 0%,#006837 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;">
                <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Dwitku</span>
              </div>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:12px 0 0;">Verifikasi Akun Dwitku Kamu</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                Halo ${userName}!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                Terima kasih telah mendaftar di Dwitku. Silakan klik tombol di bawah ini untuk memverifikasi alamat email kamu dan mengaktifkan akunmu secara penuh.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}"
                       style="display:inline-block;background:#004C29;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;letter-spacing:0.01em;">
                      Verifikasi Email Sekarang →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#e6f3ec;border-radius:10px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:13px;color:#004C29;font-weight:600;">
                      🔗 Atau salin link berikut ke browsermu:
                    </p>
                    <p style="margin:0;font-size:12px;color:#004C29;word-break:break-all;font-family:monospace;">
                      ${verificationLink}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#a1a1aa;">
                Jika kamu tidak merasa mendaftar akun di Dwitku, abaikan email ini dengan aman.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;border-top:1px solid #f0f0f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                Email ini dikirim oleh Dwitku · Pencatatan Keuangan Bersama
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Template HTML email reset password Dwitku */
export function buildResetPasswordEmail({
    resetLink,
    userName,
}: {
    resetLink: string;
    userName: string;
}) {
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password Dwitku</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#004C29 0%,#00381e 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;">
                <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Dwitku</span>
              </div>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:12px 0 0;">Atur Ulang Password Akun</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                Permintaan Reset Password
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                Halo ${userName}, kami menerima permintaan untuk mengatur ulang password akun Dwitku kamu. Klik tombol di bawah ini untuk membuat password baru.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}"
                       style="display:inline-block;background:#004C29;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;letter-spacing:0.01em;">
                      Atur Ulang Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">
                      🔗 Atau salin link berikut:
                    </p>
                    <p style="margin:0;font-size:12px;color:#004C29;word-break:break-all;font-family:monospace;">
                      ${resetLink}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#a1a1aa;">
                Link ini akan kadaluarsa dalam 1 jam. Jika kamu tidak meminta reset password, abaikan email ini dan passwordmu tetap aman.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;border-top:1px solid #f0f0f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                Email ini dikirim oleh Dwitku · Pencatatan Keuangan Bersama
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Template HTML email notifikasi aktivasi langganan oleh Admin */
export function buildSubscriptionActivatedEmail({
    userName,
    planName,
    planKey,
    durationLabel,
    expiryDate,
    dashboardLink,
}: {
    userName: string;
    planName: string;
    planKey: string;
    durationLabel: string;
    expiryDate?: string;
    dashboardLink: string;
}) {
    const isPro = planKey === "pro";
    const badgeBg = isPro ? "#fef3c7" : "#e6f3ec";
    const badgeText = isPro ? "#b45309" : "#004C29";

    const features = isPro
        ? [
            "Unlimited Workspaces & Anggota Tim",
            "Unlimited Transaksi & Kategori",
            "Ekspor Data ke Excel & CSV (XLSX)",
            "Deep Insights & Proyeksi Arus Kas",
            "Mode Penjualan / Kasir (Sales) & Multi-Dompet",
            "Dukungan Prioritas VIP & Cloud Backup",
        ]
        : [
            "Hingga 3 Workspace Aktif",
            "Hingga 500 Transaksi per Bulan",
            "Kolaborasi hingga 5 Anggota Tim",
            "15 Kategori Kustom",
            "Ekspor Data ke Excel & CSV",
            "Akses Mode Penjualan / Kasir (Sales)",
        ];

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Langganan Dwitku Aktif</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#004C29 0%,#006837 100%);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.18);border-radius:20px;padding:6px 14px;margin-bottom:12px;">
                <span style="font-size:12px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:1px;">👑 Langganan Aktif</span>
              </div>
              <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Dwitku</div>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;">Selamat menikmati fitur premium Dwitku</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                Halo ${userName}, Akunmu Telah Ditingkatkan! 🎉
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                Administrator Dwitku telah mengaktifkan paket langganan premium untuk akun kamu. Seluruh fitur eksklusif kini dapat langsung kamu gunakan.
              </p>

              <!-- Plan Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;margin-bottom:24px;padding:20px;">
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                      <span style="font-size:12px;color:#6b7280;font-weight:600;">Paket Langganan:</span>
                      <span style="font-size:13px;font-weight:800;background:${badgeBg};color:${badgeText};padding:3px 10px;border-radius:12px;text-transform:uppercase;">
                        ${planName}
                      </span>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                      <span style="font-size:12px;color:#6b7280;font-weight:600;">Durasi Akses:</span>
                      <span style="font-size:13px;font-weight:700;color:#1f2937;">${durationLabel}</span>
                    </div>
                    ${expiryDate ? `
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                      <span style="font-size:12px;color:#6b7280;font-weight:600;">Aktif Sampai:</span>
                      <span style="font-size:13px;font-weight:700;color:#004C29;">${expiryDate}</span>
                    </div>
                    ` : ""}
                  </td>
                </tr>
              </table>

              <!-- Unlocked Features -->
              <div style="margin-bottom:28px;">
                <p style="font-size:13px;font-weight:700;color:#1f2937;margin:0 0 10px;">Fitur yang Terbuka untuk Kamu:</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${features.map(f => `
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#4b5563;">
                        <span style="color:#004C29;font-weight:bold;margin-right:8px;">✓</span> ${f}
                      </td>
                    </tr>
                  `).join("")}
                </table>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${dashboardLink}"
                       style="display:inline-block;background:#004C29;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;letter-spacing:0.01em;">
                      Mulai Menggunakan Dwitku →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
                Jika kamu memiliki pertanyaan, tim dukungan Dwitku siap membantu kapan saja.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;border-top:1px solid #f0f0f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                Email ini dikirim oleh Dwitku · Pencatatan Keuangan Bersama
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

