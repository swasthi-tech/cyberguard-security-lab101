import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getDb } from './db.js';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function generateAndSendOTP(email: string, purpose: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('SMTP credentials not configured.');
    throw new Error('Email service not configured');
  }

  // Generate a cryptographically secure 6 digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const id = crypto.randomUUID();
  
  // Hash the OTP (with a pepper) to prevent database leakage issues
  const otpHash = crypto.createHash('sha256').update(otp + process.env.SESSION_SECRET).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins

  const db = await getDb();
  await db.run(
    'INSERT INTO otps (id, email, purpose, otpHash, expiresAt) VALUES (?, ?, ?, ?, ?)',
    [id, email, purpose, otpHash, expiresAt]
  );

  const transporter = getTransporter();
  const mailOptions = {
    from: process.env.MAIL_FROM || `"CyberGuard Security Lab" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'CyberGuard Security Lab - Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #164e63; background-color: #0b1120; color: #e2e8f0; border-radius: 8px;">
        <h2 style="color: #22d3ee; border-bottom: 1px solid #164e63; padding-bottom: 10px;">CyberGuard Security Lab</h2>
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <div style="background-color: #0f172a; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; border: 1px solid #334155;">
          <strong style="font-size: 24px; color: #22d3ee; letter-spacing: 5px;">${otp}</strong>
        </div>
        <p>This code expires in 5 minutes.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">If you did not request this code, ignore this email. Do not share this code with anyone.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

export async function verifyOTP(email: string, otp: string, purpose: string): Promise<boolean> {
  const db = await getDb();
  
  // Get the most recent unverified OTP for this email and purpose
  const record = await db.get(
    'SELECT * FROM otps WHERE email = ? AND purpose = ? AND verifiedAt IS NULL ORDER BY createdAt DESC LIMIT 1',
    [email, purpose]
  );

  if (!record) return false;

  // Check expiry
  if (new Date(record.expiresAt) < new Date()) {
    return false;
  }

  // Check attempts
  if (record.attempts >= 3) {
    return false;
  }

  // Increment attempts
  await db.run('UPDATE otps SET attempts = attempts + 1 WHERE id = ?', [record.id]);

  // Verify hash
  const expectedHash = crypto.createHash('sha256').update(otp + process.env.SESSION_SECRET).digest('hex');
  const a = Buffer.from(expectedHash);
  const b = Buffer.from(record.otpHash);
  
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return false;
  }

  // Mark as verified
  await db.run('UPDATE otps SET verifiedAt = CURRENT_TIMESTAMP WHERE id = ?', [record.id]);
  return true;
}

export async function hasVerifiedOTP(email: string, purpose: string, withinMinutes: number = 15): Promise<boolean> {
  const db = await getDb();
  // Check if they verified an OTP for this purpose recently
  const timeLimit = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();
  const record = await db.get(
    'SELECT id FROM otps WHERE email = ? AND purpose = ? AND verifiedAt > ? ORDER BY verifiedAt DESC LIMIT 1',
    [email, purpose, timeLimit]
  );
  return !!record;
}
