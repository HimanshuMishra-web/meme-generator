import { Request, Response } from 'express';
import Contact from '../models/Contact';
import User from '../models/User';

// Create a new contact enquiry (public endpoint)
export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const contact = new Contact({
      name,
      email,
      subject,
      message
    });

    await contact.save();

    res.status(201).json({ 
      message: 'Contact enquiry submitted successfully',
      contact 
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all contact enquiries (admin only)
export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('assignedTo', 'name email');

    const total = await Contact.countDocuments(filter);

    res.json({
      contacts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single contact enquiry by ID
export const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id).populate('assignedTo', 'name email');

    if (!contact) {
      res.status(404).json({ message: 'Contact enquiry not found' });
      return;
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update contact enquiry status and assignment
export const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, notes } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      res.status(404).json({ message: 'Contact enquiry not found' });
      return;
    }

    if (status) contact.status = status;
    if (priority) contact.priority = priority;
    if (assignedTo) contact.assignedTo = assignedTo;
    if (notes !== undefined) contact.notes = notes;

    await contact.save();

    res.json({ 
      message: 'Contact enquiry updated successfully',
      contact 
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a contact enquiry
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      res.status(404).json({ message: 'Contact enquiry not found' });
      return;
    }

    res.json({ message: 'Contact enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's own contact enquiries
export const getUserContactEnquiries = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Get user details to find their email
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const enquiries = await Contact.find({ email: user.email })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(enquiries);
  } catch (error) {
    console.error('Error getting user contact enquiries:', error);
    res.status(500).json({ message: 'Error getting user contact enquiries' });
  }
};

// Get contact statistics
export const getContactStats = async (req: Request, res: Response) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          urgentPriority: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
        }
      }
    ]);

    res.json(stats[0] || {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      highPriority: 0,
      urgentPriority: 0
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 