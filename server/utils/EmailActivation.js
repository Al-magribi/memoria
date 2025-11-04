import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Pastikan ini menggunakan Sandi Aplikasi
  },
});

// Send activation email
export const sendActivationEmail = async (email, name, activationCode) => {
  const activationUrl = `${process.env.DOMAIN}/activation/${activationCode}`;

  const mailOptions = {
    from: process.env.SMTP_APP,
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

  // HAPUS try...catch di sini. Biarkan error dilempar ke router.
  await transporter.sendMail(mailOptions);
  return true; // Jika sukses
};
