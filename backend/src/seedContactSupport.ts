import mongoose from 'mongoose';
import Permission from './models/Permission';
import Role from './models/Role';
import { connectDB } from './config/db';

const seedContactSupportPermissions = async () => {
  try {
    await connectDB();

    // Create Contact Management permissions
    const contactPermissions = [
      {
        name: 'View Contact Enquiries',
        slug: 'view_contact_enquiries',
        description: 'Can view contact enquiries submitted by users'
      },
      {
        name: 'Update Contact Enquiries',
        slug: 'update_contact_enquiries',
        description: 'Can update status and priority of contact enquiries'
      },
      {
        name: 'Delete Contact Enquiries',
        slug: 'delete_contact_enquiries',
        description: 'Can delete contact enquiries'
      },
      {
        name: 'View Contact Statistics',
        slug: 'view_contact_stats',
        description: 'Can view contact enquiry statistics'
      }
    ];

    // Create Support Management permissions
    const supportPermissions = [
      {
        name: 'View Support Tickets',
        slug: 'view_support_tickets',
        description: 'Can view support tickets submitted by users'
      },
      {
        name: 'Update Support Tickets',
        slug: 'update_support_tickets',
        description: 'Can update status, priority, and category of support tickets'
      },
      {
        name: 'Delete Support Tickets',
        slug: 'delete_support_tickets',
        description: 'Can delete support tickets'
      },
      {
        name: 'View Support Statistics',
        slug: 'view_support_stats',
        description: 'Can view support ticket statistics'
      },
      {
        name: 'Assign Support Tickets',
        slug: 'assign_support_tickets',
        description: 'Can assign support tickets to other team members'
      }
    ];

    // Insert permissions
    for (const permission of [...contactPermissions, ...supportPermissions]) {
      try {
        await Permission.findOneAndUpdate(
          { slug: permission.slug },
          permission,
          { upsert: true, new: true }
        );
        console.log(`✓ Created/Updated permission: ${permission.name}`);
      } catch (error) {
        console.error(`✗ Error creating permission ${permission.name}:`, error);
      }
    }

    // Update admin role to include contact and support permissions
    const adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
      const newPermissions = [
        'view_contact_enquiries',
        'update_contact_enquiries',
        'view_contact_stats',
        'view_support_tickets',
        'update_support_tickets',
        'view_support_stats',
        'assign_support_tickets'
      ];

      // Add new permissions without duplicates
      const updatedPermissions = [...new Set([...adminRole.permissions, ...newPermissions])];
      adminRole.permissions = updatedPermissions;
      await adminRole.save();
      console.log('✓ Updated admin role with contact and support permissions');
    }

    // Update super_admin role to include all permissions
    const superAdminRole = await Role.findOne({ name: 'super_admin' });
    if (superAdminRole) {
      const allPermissions = [
        'view_contact_enquiries',
        'update_contact_enquiries',
        'delete_contact_enquiries',
        'view_contact_stats',
        'view_support_tickets',
        'update_support_tickets',
        'delete_support_tickets',
        'view_support_stats',
        'assign_support_tickets'
      ];

      // Add new permissions without duplicates
      const updatedPermissions = [...new Set([...superAdminRole.permissions, ...allPermissions])];
      superAdminRole.permissions = updatedPermissions;
      await superAdminRole.save();
      console.log('✓ Updated super_admin role with all contact and support permissions');
    }

    console.log('✓ Contact and Support permissions seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding contact and support permissions:', error);
    process.exit(1);
  }
};

seedContactSupportPermissions(); 