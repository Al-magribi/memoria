import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send activation email
export const sendActivationEmail = async (email, name, activationCode) => {
  const activationUrl = `${
    process.env.MODE === "prod" ? process.env.DOMAIN : process.env.LOCAL
  }/activate/${activationCode}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Aktivasi Akun",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Aktivasi Akun</h2>
        <p>Halo ${name},</p>
        <p>Terima kasih telah mendaftar di platform kami. Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Aktivasi Akun
          </a>
        </div>
        <p>Link ini akan kadaluarsa dalam 24 jam.</p>
        <p>Terima kasih,<br>Tim Support</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};
