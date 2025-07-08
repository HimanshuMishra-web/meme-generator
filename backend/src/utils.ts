import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { ErrorResponseParams, SucceessResponseParams } from "./types";

// Helper function to generate a JWT token
type JwtPayload = string | object | Buffer;

export function success({ message, data }: SucceessResponseParams) {
  return {
    success: true,
    message,
    data,
  };
}

export function error({ message, errors }: ErrorResponseParams) {
  return {
    success: false,
    message,
    errors,
  };
}

export function generateJwtToken(
  payload: JwtPayload,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"] = "1h"
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

// Helper function to hash a password using bcrypt
export async function hashPassword(
  password: string,
  saltRounds: number = 12
): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

// Helper function to compare a plain password with a hashed password
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
}

// Utility to wrap async route handlers for global try-catch
export const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);
