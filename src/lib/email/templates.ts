/**
 * templates.ts
 * HTML email templates for verification and password reset.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const wrapper = (content: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:system-ui,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#0f0f0f;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:24px;border:1px solid #2a2a2a;overflow:hidden;max-width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7C3AED,#5B21B6);padding:32px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">ذكاوي</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">تعلم الذكاء الاصطناعي</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;border-top:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0;font-size:12px;color:#666;">
              © 2025 ذكاوي · <a href="${BASE_URL}" style="color:#7C3AED;text-decoration:none;">zkawi.com</a>
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#444;">
              لو مش طلبت ده، تجاهل الإيميل ده بكل أمان.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export function verificationEmailHtml(url: string): string {
  return wrapper(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#fff;">تأكيد إيميلك</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#aaa;line-height:1.6;">
      أهلاً بيك في ذكاوي! اضغط الزرار اللي تحت عشان تأكد إيميلك وتبدأ رحلة التعلم.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${url}"
         style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:16px;font-weight:700;">
        تأكيد الإيميل
      </a>
    </div>
    <p style="margin:0;font-size:13px;color:#555;text-align:center;">
      الرابط ده بيفضل شغال 24 ساعة بس.
    </p>
  `);
}

export function resetPasswordEmailHtml(url: string): string {
  return wrapper(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#fff;">إعادة تعيين كلمة السر</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#aaa;line-height:1.6;">
      طلبت إعادة تعيين كلمة السر بتاعتك. اضغط الزرار اللي تحت عشان تعمل كلمة سر جديدة.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${url}"
         style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:16px;font-weight:700;">
        إعادة تعيين كلمة السر
      </a>
    </div>
    <p style="margin:0;font-size:13px;color:#555;text-align:center;">
      الرابط ده بيفضل شغال ساعة بس. لو مش طلبت، تجاهل الإيميل ده.
    </p>
  `);
}
