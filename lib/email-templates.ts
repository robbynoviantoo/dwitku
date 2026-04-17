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
            <td style="background:linear-gradient(135deg,#16a34a 0%,#22c55e 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;">
                <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Dwitku</span>
              </div>
              <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:12px 0 0;">Verifikasi Akun Kamu</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                Halo ${userName}!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                Terima kasih telah mendaftar di Dwitku. Silakan klik tombol di bawah ini untuk memverifikasi alamat email kamu dan mengaktifkan akunmu.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}"
                       style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;letter-spacing:0.01em;">
                      Verifikasi Email →
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
                    <p style="margin:0;font-size:12px;color:#16a34a;word-break:break-all;font-family:monospace;">
                      ${verificationLink}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#a1a1aa;">
                Jika kamu tidak merasa mendaftar di Dwitku, abaikan email ini.
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
            <td style="background:linear-gradient(135deg,#ef4444 0%,#f87171 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;">
                <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Dwitku</span>
              </div>
              <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:12px 0 0;">Lupa Password?</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                Atur Ulang Password Kamu
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
                Halo ${userName}, kami menerima permintaan untuk mengatur ulang password akun Dwitku kamu. Klik tombol di bawah ini untuk melanjutkan.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}"
                       style="display:inline-block;background:#ef4444;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;letter-spacing:0.01em;">
                      Reset Password →
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
                    <p style="margin:0;font-size:12px;color:#ef4444;word-break:break-all;font-family:monospace;">
                      ${resetLink}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#a1a1aa;">
                Link ini akan kadaluarsa dalam 1 jam. Jika kamu tidak meminta reset password, silakan abaikan email ini.
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
