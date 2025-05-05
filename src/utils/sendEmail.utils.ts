import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  message: string;
}

/**
 * Gửi email sử dụng Nodemailer.
 * @param {EmailOptions} options - Các tùy chọn email.
 */
export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: parseInt(process.env.SMPT_PORT || '587'),
    secure: true, // Use SSL
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_APP_PASS,
    },
    // authMethod: 'LOGIN', // Specify the authentication method
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.to,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};
