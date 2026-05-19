const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { company, name, email, tel, message } = req.body || {};

  if (!company || !name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 環境変数の存在確認（診断用・後で削除）
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    return res.status(500).json({
      error: 'Env vars missing',
      detail: `GMAIL_USER: ${gmailUser ? '設定済み' : '未設定'}, GMAIL_APP_PASSWORD: ${gmailPass ? '設定済み' : '未設定'}`,
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: `【お問い合わせ】${company} ${name}様`,
    text: [
      `貴社名：${company}`,
      `ご担当者名：${name}`,
      `メールアドレス：${email}`,
      `電話番号：${tel || '未記入'}`,
      `問い合わせ内容：\n${message || '未記入'}`,
    ].join('\n'),
  };

  const autoReplyHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Hiragino Kaku Gothic Pro', Meiryo, sans-serif; color: #333; line-height: 1.8; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { background-color: #2c3e50; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
    .body { background-color: #f9f9f9; padding: 32px; border: 1px solid #e0e0e0; }
    .footer { background-color: #f0f0f0; padding: 20px; font-size: 13px; color: #555; border-radius: 0 0 8px 8px; line-height: 2; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin:0; font-size:20px;">お問い合わせありがとうございます</h2>
      <p style="margin:8px 0 0; font-size:13px; opacity:0.8;">質問王国</p>
    </div>
    <div class="body">
      <p>${name} 様</p>
      <p>こんにちは、質問王国の原田です。</p>
      <p>このたびはお問い合わせいただき、ありがとうございます！</p>
      <p>
        内容をしっかり確認させていただいたうえで、3営業日以内にご連絡いたします。<br>
        もう少しだけお待ちいただけると嬉しいです😊
      </p>
      <p>ご不明な点などございましたら、お気軽にご連絡ください。</p>
    </div>
    <div class="footer">
      質問王国<br>
      担当 原田<br>
      mharada24365@gmail.com
    </div>
  </div>
</body>
</html>`;

  const autoReplyOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `【質問王国】お問い合わせありがとうございます`,
    html: autoReplyHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(autoReplyOptions);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('nodemailer error:', err);
    return res.status(500).json({
      error: 'Mail send failed',
      detail: err.message,
      code: err.code || null,
    });
  }
};
