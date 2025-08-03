import { Request, Response } from "express";
import Meme from "../models/Meme";
import GeneratedImage from "../models/GeneratedImage";
import Transaction from "../models/Transaction";
import User from "../models/User";
import { success, error } from "../utils";

// Helper function to get date range
const getDateRange = (filter: string) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'today':
      return { start: startOfDay, end: now };
    case 'week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return { start: startOfWeek, end: now };
    case 'month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfMonth, end: now };
    case 'all':
      return { start: new Date(0), end: now };
    default:
      return { start: new Date(0), end: now };
  }
};

// Helper function to get date range from custom dates
const getCustomDateRange = (startDate: string, endDate: string) => {
  return {
    start: new Date(startDate),
    end: new Date(endDate)
  };
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { filter = 'all', startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = getCustomDateRange(startDate as string, endDate as string);
    } else {
      dateRange = getDateRange(filter as string);
    }

    const dateFilter = {
      createdAt: {
        $gte: dateRange.start,
        $lte: dateRange.end
      }
    };

    // Get meme statistics
    const memeStats = await Meme.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          public: { $sum: { $cond: [{ $eq: ['$is_public', true] }, 1, 0] } },
          private: { $sum: { $cond: [{ $eq: ['$is_public', false] }, 1, 0] } },
          premium: { $sum: { $cond: [{ $eq: ['$isPremium', true] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$publicationStatus', 'approved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$publicationStatus', 'pending'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$publicationStatus', 'rejected'] }, 1, 0] } }
        }
      }
    ]);

    // Get AI generated image statistics
    const aiStats = await GeneratedImage.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          public: { $sum: { $cond: [{ $eq: ['$is_public', true] }, 1, 0] } },
          private: { $sum: { $cond: [{ $eq: ['$is_public', false] }, 1, 0] } },
          premium: { $sum: { $cond: [{ $eq: ['$isPremium', true] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$publicationStatus', 'approved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$publicationStatus', 'pending'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$publicationStatus', 'rejected'] }, 1, 0] } }
        }
      }
    ]);

    // Get transaction statistics
    const transactionStats = await Transaction.aggregate([
      { 
        $match: { 
          ...dateFilter,
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
          platformEarnings: { $sum: '$platformEarnings' },
          sellerEarnings: { $sum: '$sellerEarnings' },
          avgTransactionValue: { $avg: '$price' }
        }
      }
    ]);

    // Get premium meme sales statistics
    const premiumMemeStats = await Meme.aggregate([
      { 
        $match: { 
          ...dateFilter,
          isPremium: true 
        } 
      },
      {
        $group: {
          _id: null,
          totalPremium: { $sum: 1 },
          totalSold: { $sum: '$soldCount' },
          totalEarnings: { $sum: '$totalEarnings' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    // Get premium AI generated image sales statistics
    const premiumAIStats = await GeneratedImage.aggregate([
      { 
        $match: { 
          ...dateFilter,
          isPremium: true 
        } 
      },
      {
        $group: {
          _id: null,
          totalPremium: { $sum: 1 },
          totalSold: { $sum: '$soldCount' },
          totalEarnings: { $sum: '$totalEarnings' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    // Get user statistics
    const userStats = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          premiumUsers: { $sum: { $cond: [{ $eq: ['$role', 'premium'] }, 1, 0] } },
          regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
        }
      }
    ]);

    // Get daily trends for the last 30 days
    const dailyTrends = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          transactionDate: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            $lte: new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$transactionDate" }
          },
          revenue: { $sum: '$price' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get meme creation trends
    const memeCreationTrends = await Meme.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            $lte: new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get AI generation trends
    const aiGenerationTrends = await GeneratedImage.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            $lte: new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Ensure we have valid data with fallbacks
    const memeData = memeStats[0] || {
      total: 0, public: 0, private: 0, premium: 0, approved: 0, pending: 0, rejected: 0
    };
    
    const aiData = aiStats[0] || {
      total: 0, public: 0, private: 0, premium: 0, approved: 0, pending: 0, rejected: 0
    };
    
    const transactionData = transactionStats[0] || {
      totalTransactions: 0, totalRevenue: 0, platformEarnings: 0, sellerEarnings: 0, avgTransactionValue: 0
    };
    
    const premiumMemeData = premiumMemeStats[0] || {
      totalPremium: 0, totalSold: 0, totalEarnings: 0, avgPrice: 0
    };
    
    const premiumAIData = premiumAIStats[0] || {
      totalPremium: 0, totalSold: 0, totalEarnings: 0, avgPrice: 0
    };
    
    const userData = userStats[0] || {
      totalUsers: 0, premiumUsers: 0, regularUsers: 0
    };

    const analytics = {
      overview: {
        totalMemes: memeData.total + aiData.total,
        totalPublic: memeData.public + aiData.public,
        totalPrivate: memeData.private + aiData.private,
        totalPremium: memeData.premium + aiData.premium,
        totalApproved: memeData.approved + aiData.approved,
        totalPending: memeData.pending + aiData.pending,
        totalRejected: memeData.rejected + aiData.rejected
      },
      memes: {
        total: memeData.total,
        public: memeData.public,
        private: memeData.private,
        premium: memeData.premium,
        approved: memeData.approved,
        pending: memeData.pending,
        rejected: memeData.rejected
      },
      aiGenerated: {
        total: aiData.total,
        public: aiData.public,
        private: aiData.private,
        premium: aiData.premium,
        approved: aiData.approved,
        pending: aiData.pending,
        rejected: aiData.rejected
      },
      revenue: {
        totalRevenue: transactionData.totalRevenue,
        totalTransactions: transactionData.totalTransactions,
        platformEarnings: transactionData.platformEarnings,
        sellerEarnings: transactionData.sellerEarnings,
        avgTransactionValue: transactionData.avgTransactionValue
      },
      premiumSales: {
        memeSales: {
          totalPremium: premiumMemeData.totalPremium,
          totalSold: premiumMemeData.totalSold,
          totalEarnings: premiumMemeData.totalEarnings,
          avgPrice: premiumMemeData.avgPrice
        },
        aiSales: {
          totalPremium: premiumAIData.totalPremium,
          totalSold: premiumAIData.totalSold,
          totalEarnings: premiumAIData.totalEarnings,
          avgPrice: premiumAIData.avgPrice
        }
      },
      users: {
        totalUsers: userData.totalUsers,
        premiumUsers: userData.premiumUsers,
        regularUsers: userData.regularUsers
      },
      trends: {
        dailyRevenue: dailyTrends,
        memeCreation: memeCreationTrends,
        aiGeneration: aiGenerationTrends
      },
      dateRange: {
        start: dateRange.start,
        end: dateRange.end,
        filter: filter
      }
    };

    res.json(success({ message: "Analytics data retrieved successfully", data: analytics }));
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json(error({ message: "Failed to retrieve analytics data" }));
  }
};

export const getTopSellingMemes = async (req: Request, res: Response) => {
  try {
    const { limit = 10, filter = 'all', startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = getCustomDateRange(startDate as string, endDate as string);
    } else {
      dateRange = getDateRange(filter as string);
    }

    const dateFilter = {
      createdAt: {
        $gte: dateRange.start,
        $lte: dateRange.end
      }
    };

    // Get top selling memes
    const topMemes = await Meme.aggregate([
      { 
        $match: { 
          ...dateFilter,
          isPremium: true,
          soldCount: { $gt: 0 }
        } 
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $unwind: '$creator'
      },
      {
        $project: {
          title: 1,
          url: 1,
          price: 1,
          soldCount: 1,
          totalEarnings: 1,
          createdAt: 1,
          'creator.username': 1,
          'creator.email': 1
        }
      },
      {
        $sort: { soldCount: -1 }
      },
      {
        $limit: parseInt(limit as string)
      }
    ]);

    // Get top selling AI generated images
    const topAI = await GeneratedImage.aggregate([
      { 
        $match: { 
          ...dateFilter,
          isPremium: true,
          soldCount: { $gt: 0 }
        } 
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $unwind: '$creator'
      },
      {
        $project: {
          title: 1,
          url: 1,
          price: 1,
          soldCount: 1,
          totalEarnings: 1,
          createdAt: 1,
          'creator.username': 1,
          'creator.email': 1
        }
      },
      {
        $sort: { soldCount: -1 }
      },
      {
        $limit: parseInt(limit as string)
      }
    ]);

    res.json(success({ 
      message: "Top selling items retrieved successfully", 
      data: {
        memes: topMemes,
        aiGenerated: topAI
      }
    }));
  } catch (err) {
    console.error('Top selling error:', err);
    res.status(500).json(error({ message: "Failed to retrieve top selling items" }));
  }
}; 