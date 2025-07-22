import User from "../models/User";
import { Request, Response } from "express";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, permissions } = req.body;
    const profileImage = req.file?.filename; // Get uploaded file filename

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or username already exists" });
    }

    const user = new User({ 
      username, 
      email, 
      password, 
      role, 
      permissions,
      profileImage 
    });
    await user.save();

    // Return user without password
    const { password: d, ...userResponse } = user.toObject();
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { password, ...updateData } = req.body;

    // Check if user exists and prevent updating super_admin
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent updating super_admin users
    if (existingUser.role === 'super_admin') {
      return res.status(403).json({ message: "Cannot update super admin user" });
    }

    // If password is being updated, hash it
    let updateFields = updateData;
    if (password) {
      const user = await User.findById(req.params.id);
      if (user) {
        user.password = password;
        await user.save();
        updateFields = { ...updateData, password: user.password };
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // Check if user exists and prevent deleting super_admin
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting super_admin users
    if (existingUser.role === 'super_admin') {
      return res.status(403).json({ message: "Cannot delete super admin user" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
};

export const updateUserPermissions = async (req: Request, res: Response) => {
  try {
    const { permissions } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent updating permissions for super_admin
    if (user.role === 'super_admin') {
      return res.status(403).json({ message: "Cannot update permissions for super admin" });
    }

    // Update user permissions
    user.permissions = permissions || [];
    await user.save();

    // Return user without password
    const { password, ...userResponse } = user.toObject();
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user permissions", error });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  try {
    const { password, ...updateData } = req.body;
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }
    // If password is being updated, hash it
    let updateFields = updateData;
    if (password) {
      const user = await User.findById(userId);
      if (user) {
        user.password = password;
        await user.save();
        updateFields = { ...updateData, password: user.password };
      }
    }
    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error });
  }
};
