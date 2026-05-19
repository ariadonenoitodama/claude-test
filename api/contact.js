const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { company, name, email, tel, message } = req.body || {};

  if (!company || !name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
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

  try {
    await transporter.sendMail(mailOptions);
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
