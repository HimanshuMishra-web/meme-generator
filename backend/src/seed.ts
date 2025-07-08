import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import User from './models/User';
import Role from './models/Role';
import Permission from './models/Permission';
import {hashPassword} from  "./utils";

// Load environment variables
dotenv.config();

async function seed() {
  await connectDB();

  // Clear existing data
  await Permission.deleteMany({});
  await Role.deleteMany({});
  await User.deleteMany({});

  // Seed permissions
  const permissions = [
    { name: 'Create Meme', slug: 'create_meme', description: 'Can create memes' },
    { name: 'Edit Meme', slug: 'edit_meme', description: 'Can edit memes' },
    { name: 'Delete Meme', slug: 'delete_meme', description: 'Can delete memes' },
    { name: 'View Users', slug: 'view_users', description: 'Can view users' },
    { name: 'Manage Roles', slug: 'manage_roles', description: 'Can manage roles' },
  ];
  const createdPermissions = await Permission.insertMany(permissions);

  // Seed roles
  const roles = [
    {
      name: 'admin',
      permissions: createdPermissions.map((p) => p.slug),
    },
    {
      name: 'user',
      permissions: ['create_meme'],
    },
  ];
  const createdRoles = await Role.insertMany(roles);

  // Seed users
  const bcrypt = require('bcryptjs');
  const users = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: await hashPassword('admin123'),
      role: 'admin',
      permissions: createdRoles.find((r) => r.name === 'admin')?.permissions || [],
    },
    {
      username: 'user',
      email: 'user@example.com',
      password: await hashPassword("user123"),
      role: 'user',
      permissions: createdRoles.find((r) => r.name === 'user')?.permissions || [],
    },
  ];
  await User.insertMany(users);

  console.log('Database seeded successfully!');
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  mongoose.connection.close();
}); 