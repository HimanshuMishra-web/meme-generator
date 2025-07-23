import User from "../models/User";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { sendEmail, success, error } from "../utils";
import { FRONTEND_URL, USER_ROLE } from "../constants";
import Token from "../models/Token";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  const payload = {
    id: user._id,
    role: user.role,
    permissions: user.permissions,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  res.json(success({ message: "Login Successful", data: { user, token } }));
};

export const signup = async (req: Request, res: Response) => {
  const { username, email, password, role = USER_ROLE, permissions } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });
    const user = new User({ username, email, password, role, permissions });
    await user.save();
    const payload = {
      id: user._id,
      role: user.role,
      permissions: user.permissions,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
    res
      .status(201)
      .json(
        success({ message: "Sign Up Successfully", data: { user, token } })
      );
  } catch (err) {
    res.status(500).json({ message: "Error signing up", error: err });
  }
};

export const logout = async (req: Request, res: Response) => {
  // For JWT, logout is handled on the client by deleting the token
  res.json({ message: "Logged out successfully" });
};

export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate a secure reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

  // Remove any existing tokens for this user
  await Token.deleteMany({ user: user._id });

  // Save the new token
  await Token.create({ user: user._id, token: resetToken, expiry });

  const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  const resetEmailHtml = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Reset Your Password</title>
      <style>
        .container { max-width: 480px; margin: 0 auto; background: #fffbe7; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px 24px; font-family: 'Segoe UI', Arial, sans-serif; color: #22223b; }
        .header { text-align: center; margin-bottom: 24px; }
        .header img { width: 64px; margin-bottom: 8px; }
        .title { font-size: 1.5rem; font-weight: bold; margin-bottom: 8px; }
        .text { font-size: 1rem; margin-bottom: 24px; color: #4a4e69; }
        .button { display: block; width: 100%; background: #f9c74f; color: #22223b; text-decoration: none; padding: 14px 0; border-radius: 6px; font-size: 1.1rem; font-weight: bold; text-align: center; margin-bottom: 24px; transition: background 0.2s; }
        .button:hover { background: #f9844a; color: #fff; }
        .footer { font-size: 0.95rem; color: #9a8c98; text-align: center; }
      </style>
    </head>
    <body style="background: #f8f9fa; padding: 32px 0;">
      <div class="container">
        <div class="header">
          <img src="https://img.icons8.com/fluency/96/lock-2.png" alt="Reset Password" />
          <div class="title">Reset Your Password</div>
        </div>
        <div class="text">
          We received a request to reset your password for your Meme Generator account.<br>
          Click the button below to set a new password. This link will expire in 1 hour.
        </div>
        <a href="${resetLink}" class="button">Reset Password</a>
        <div class="text" style="font-size:0.95rem;">
          If you did not request a password reset, you can safely ignore this email.
        </div>
        <div class="footer">
          &copy; Meme Generator Team
        </div>
      </div>
    </body>
  </html>
  `;
  try {
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: `Click the following link to reset your password: ${resetLink}`,
      html: resetEmailHtml,
    });
    res.json({ message: "Password reset link sent to email." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send email", error: err });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const tokenDoc = await Token.findOne({ user: user._id, token });
  if (!tokenDoc || tokenDoc.expiry < new Date()) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = newPassword;
  await user.save();
  await Token.deleteMany({ user: user._id }); // Remove all tokens after reset

  res.json({ message: "Password has been reset successfully." });
};
