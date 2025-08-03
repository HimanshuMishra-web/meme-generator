# Contact & Support Features Implementation

## Overview
This document outlines the implementation of Contact and Support management features for the MemeForge platform, including both frontend pages and backend infrastructure with proper permission management.

## New Pages Added

### 1. Contact Page (`/contact`)
- **Location**: `src/Pages/ContactPage.tsx`
- **Features**:
  - Public contact form for user enquiries
  - Form validation with react-hook-form
  - Modern UI with gradient backgrounds
  - Contact information and FAQ sections
  - Success/error notifications

### 2. Support Page (`/support`)
- **Location**: `src/Pages/SupportPage.tsx`
- **Features**:
  - Support ticket creation form (requires authentication)
  - Category selection (Technical, Billing, Feature Request, Bug Report, General)
  - Priority levels (Low, Medium, High, Urgent)
  - Quick help section with common issues
  - Response time information
  - Authentication check with sign-in prompt

### 3. Privacy Page (`/privacy`)
- **Location**: `src/Pages/PrivacyPage.tsx`
- **Features**:
  - Comprehensive privacy policy
  - Information collection details
  - Data usage explanations
  - User rights section
  - Cookie and tracking information
  - Contact information for privacy concerns

## Backend Implementation

### Models

#### Contact Model (`backend/src/models/Contact.ts`)
```typescript
interface IContact {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Support Model (`backend/src/models/Support.ts`)
```typescript
interface ISupport {
  user: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  attachments?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Controllers

#### Contact Controller (`backend/src/controllers/contactController.ts`)
- `createContact` - Public endpoint for submitting contact enquiries
- `getAllContacts` - Admin endpoint for viewing all enquiries
- `getContactById` - Get specific contact enquiry
- `updateContact` - Update status, priority, assignment
- `deleteContact` - Delete contact enquiry
- `getContactStats` - Get contact statistics

#### Support Controller (`backend/src/controllers/supportController.ts`)
- `createSupport` - Create support ticket (requires auth)
- `getAllSupport` - Admin endpoint for viewing all tickets
- `getUserSupport` - User endpoint for viewing own tickets
- `getSupportById` - Get specific support ticket
- `updateSupport` - Update status, priority, assignment
- `deleteSupport` - Delete support ticket
- `getSupportStats` - Get support statistics

### Routes

#### Contact Routes (`backend/src/routes/contactRoutes.ts`)
- `POST /api/contact` - Create contact enquiry (public)
- `GET /api/contact` - Get all enquiries (admin)
- `GET /api/contact/stats` - Get statistics (admin)
- `GET /api/contact/:id` - Get specific enquiry (admin)
- `PUT /api/contact/:id` - Update enquiry (admin)
- `DELETE /api/contact/:id` - Delete enquiry (admin)

#### Support Routes (`backend/src/routes/supportRoutes.ts`)
- `POST /api/support` - Create support ticket (auth required)
- `GET /api/support/my-tickets` - Get user's own tickets
- `GET /api/support/my-tickets/:id` - Get specific user ticket
- `GET /api/support` - Get all tickets (admin)
- `GET /api/support/stats` - Get statistics (admin)
- `GET /api/support/:id` - Get specific ticket (admin)
- `PUT /api/support/:id` - Update ticket (admin)
- `DELETE /api/support/:id` - Delete ticket (admin)

## Admin Panel Integration

### New Admin Pages

#### Contact Management (`src/Pages/admin/ContactManagement.tsx`)
- Statistics dashboard with cards
- Filterable table with pagination
- Status and priority management
- Detailed view modal
- CRUD operations

#### Support Management (`src/Pages/admin/SupportManagement.tsx`)
- Statistics dashboard with cards
- Multi-filter table (status, priority, category)
- User information display
- Detailed view modal with all fields
- CRUD operations

### Admin Sidebar Updates
- Added "Contact Management" and "Support Tickets" menu items
- Proper icons and navigation
- Role-based visibility (admin and super_admin)

## Permission System

### New Permissions Created
- `view_contact_enquiries` - Can view contact enquiries
- `update_contact_enquiries` - Can update contact status/priority
- `delete_contact_enquiries` - Can delete contact enquiries
- `view_contact_stats` - Can view contact statistics
- `view_support_tickets` - Can view support tickets
- `update_support_tickets` - Can update support tickets
- `delete_support_tickets` - Can delete support tickets
- `view_support_stats` - Can view support statistics
- `assign_support_tickets` - Can assign tickets to team members

### Role Assignments
- **Admin Role**: View, update, and view stats for both contact and support
- **Super Admin Role**: Full access including delete permissions

## Frontend Integration

### Navigation Updates
- Added "Support" and "Contact" links to main navigation
- Updated footer with proper links to new pages
- Added routes in `App.tsx`

### Form Features
- React Hook Form integration
- Real-time validation
- Loading states
- Success/error notifications
- Responsive design

## Database Seeding

### Seed Script (`backend/src/seedContactSupport.ts`)
- Creates all necessary permissions
- Updates admin and super_admin roles
- Can be run independently to set up permissions

## Usage Instructions

### For Users
1. **Contact Page**: Visit `/contact` to submit general enquiries
2. **Support Page**: Visit `/support` to create support tickets (requires sign-in)

### For Admins
1. Access admin panel at `/admin`
2. Navigate to "Contact Management" or "Support Tickets"
3. View, filter, and manage enquiries/tickets
4. Update status, priority, and add internal notes

### For Super Admins
1. Full access to all features
2. Can assign permissions to other admins
3. Can delete enquiries/tickets
4. Access to all statistics

## Security Features
- Authentication required for support tickets
- Role-based access control
- Permission-based admin features
- Input validation and sanitization
- Rate limiting (can be added)

## Future Enhancements
- Email notifications for new enquiries/tickets
- File upload support for support tickets
- Advanced filtering and search
- Bulk operations
- Integration with external support tools
- Analytics and reporting features 