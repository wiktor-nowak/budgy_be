export function verifyEmailTemplate(link: string) {
  return `
  <!DOCTYPE html>
  <html>
    <body style="font-family: Arial; background:#f4f4f4; padding:20px">
      <table width="100%" style="max-width:600px;margin:auto;background:#fff">
        <tr>
          <td style="padding:32px;text-align:center">
            <h2>Verify your account</h2>
            <p>Please confirm your email address</p>
            <a href="${link}"
              style="display:inline-block;
                     padding:12px 24px;
                     background:#2563eb;
                     color:#fff;
                     text-decoration:none;
                     border-radius:4px;">
              Verify email
            </a>
            <p style="margin-top:24px;font-size:12px;color:#666">
              Link expires in 24 hours
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
