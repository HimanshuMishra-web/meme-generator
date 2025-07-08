import User from "../models/User";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { sendEmail, success, error } from "../utils";
import { USER_ROLE } from "../constants";

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
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
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
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
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
  // Simulate a reset token (in production, generate a secure token and save it)
  const resetToken = Math.random().toString(36).substr(2);
  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(
    email
  )}`;
  try {
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: `Click the following link to reset your password: ${resetLink}`,
      html: `<p>Click the following link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    });
    res.json({ message: "Password reset link sent to email." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send email", error: err });
  }
};
