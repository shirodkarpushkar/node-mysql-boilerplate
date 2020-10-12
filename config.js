import dotenv from "dotenv";

dotenv.config({
  path:
    process.env.NODE_ENV === "production" ? ".env.production" : ".env.local",
});

module.exports = {
  DBPORT: process.env.DB_PORT,
  DBHost: process.env.DB_HOST,
  DBUser: process.env.DB_USER,
  DBPassword: process.env.DB_PASSWORD,
  DBName: process.env.DB_NAME,
  tokenkey: process.env.TOKEN_KEY,
  emailVerificationLink: process.env.EMAIL_VERIFICATION_LINK,
  resetPasswordLink: process.env.RESET_PASSWORD_LINK,
  tokenExpirationTime: process.env.TOKEN_EXPIRY_TIME,
  SMTPemailAddress: process.env.SMTP_EMAIL,
  SMTPPassword: process.env.SMTP_EMAIL_PASSWORD,
  SMTPSenderEmail: process.env.SMTP_SENDER_EMAIL,
  supportEmail: process.env.SUPPORT_EMAIL,
};
