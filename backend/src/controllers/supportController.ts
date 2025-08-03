import { Request, Response } from 'express';
import Support from '../models/Support';
import User from '../models/User';

// Create a new support ticket
export const createSupport = async (req: Request, res: Response) => {
  try {
    const { subject, description, category } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!subject || !description) {
      res.status(400).json({ message: 'Subject and description are required' });
      return;
    }

    const support = new Support({
      user: userId,
      subject,
      description,
      category: category || 'general'
    });

    await support.save();

    res.status(201).json({ 
      message: 'Support ticket created successfully',
      support 
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all support tickets (admin only)
export const getAllSupport = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, priority, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const support = await Support.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    const total = await Support.countDocuments(filter);

    res.json({
      support,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's own support tickets
export const getUserSupport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { user: userId };
    if (status) filter.status = status;

    const support = await Support.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('assignedTo', 'name email');

    const total = await Support.countDocuments(filter);

    res.json({
      support,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching user support tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single support ticket by ID
export const getSupportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const support = await Support.findById(id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    if (!support) {
      res.status(404).json({ message: 'Support ticket not found' });
      return;
    }

    res.json(support);
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update support ticket status and assignment
export const updateSupport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, notes } = req.body;

    const support = await Support.findById(id);
    if (!support) {
      res.status(404).json({ message: 'Support ticket not found' });
      return;
    }

    if (status) support.status = status;
    if (priority) support.priority = priority;
    if (assignedTo) support.assignedTo = assignedTo;
    if (notes !== undefined) support.notes = notes;

    await support.save();

    res.json({ 
      message: 'Support ticket updated successfully',
      support 
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a support ticket
export const deleteSupport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const support = await Support.findByIdAndDelete(id);

    if (!support) {
      res.status(404).json({ message: 'Support ticket not found' });
      return;
    }

    res.json({ message: 'Support ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get support statistics
export const getSupportStats = async (req: Request, res: Response) => {
  try {
    const stats = await Support.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          urgentPriority: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          technical: { $sum: { $cond: [{ $eq: ['$category', 'technical'] }, 1, 0] } },
          billing: { $sum: { $cond: [{ $eq: ['$category', 'billing'] }, 1, 0] } },
          featureRequest: { $sum: { $cond: [{ $eq: ['$category', 'feature_request'] }, 1, 0] } },
          bugReport: { $sum: { $cond: [{ $eq: ['$category', 'bug_report'] }, 1, 0] } },
          general: { $sum: { $cond: [{ $eq: ['$category', 'general'] }, 1, 0] } }
        }
      }
    ]);

    res.json(stats[0] || {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      highPriority: 0,
      urgentPriority: 0,
      technical: 0,
      billing: 0,
      featureRequest: 0,
      bugReport: 0,
      general: 0
    });
  } catch (error) {
    console.error('Error fetching support stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 