import Permission from '../models/Permission';
import { Request, Response } from 'express';

export const getAllPermissions = async (req: Request, res: Response) => {
  const permissions = await Permission.find();
  res.json(permissions);
};

export const getPermissionById = async (req: Request, res: Response) => {
  const permission = await Permission.findById(req.params.id);
  if (!permission) return res.status(404).json({ message: 'Permission not found' });
  res.json(permission);
};

export const createPermission = async (req: Request, res: Response) => {
  const { name, slug, description } = req.body;
  const permission = new Permission({ name, slug, description });
  await permission.save();
  res.status(201).json(permission);
};

export const updatePermission = async (req: Request, res: Response) => {
  const permission = await Permission.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!permission) return res.status(404).json({ message: 'Permission not found' });
  res.json(permission);
};

export const deletePermission = async (req: Request, res: Response) => {
  const permission = await Permission.findByIdAndDelete(req.params.id);
  if (!permission) return res.status(404).json({ message: 'Permission not found' });
  res.json({ message: 'Permission deleted' });
}; 