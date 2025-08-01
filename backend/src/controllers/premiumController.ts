import { Request, Response } from 'express';
import Meme from '../models/Meme';
import GeneratedImage from '../models/GeneratedImage';
import Transaction from '../models/Transaction';
import PlatformSettings from '../models/PlatformSettings';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: any;
    username?: string;
  };
}

// Get platform settings
export const getPlatformSettings = async (req: Request, res: Response) => {
  try {
    let settings = await PlatformSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await PlatformSettings.create({
        commissionRate: 10,
        minimumPrice: 1,
        maximumPrice: 1000,
        updatedBy: 'system'
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error getting platform settings:', error);
    res.status(500).json({ message: 'Failed to get platform settings' });
  }
};

// Update platform settings (super admin only)
export const updatePlatformSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { commissionRate, minimumPrice, maximumPrice } = req.body;
    
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only super admins can update platform settings' });
    }
    
    let settings = await PlatformSettings.findOne();
    
    if (!settings) {
      settings = new PlatformSettings({
        commissionRate,
        minimumPrice,
        maximumPrice,
        updatedBy: req.user.username
      });
    } else {
      settings.commissionRate = commissionRate;
      settings.minimumPrice = minimumPrice;
      settings.maximumPrice = maximumPrice;
      settings.updatedBy = req.user.username || req.user.id;
      settings.updatedAt = new Date();
    }
    
    await settings.save();
    
    res.json({ message: 'Platform settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({ message: 'Failed to update platform settings' });
  }
};

// Set meme as premium
export const setPremiumMeme = async (req: AuthRequest, res: Response) => {
  try {
    const { memeId, memeType, isPremium, price } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Validate price
    const settings = await PlatformSettings.findOne();
    if (!settings) {
      return res.status(500).json({ message: 'Platform settings not found' });
    }
    
    if (isPremium && (price < settings.minimumPrice || price > settings.maximumPrice)) {
      return res.status(400).json({ 
        message: `Price must be between $${settings.minimumPrice} and $${settings.maximumPrice}` 
      });
    }
    
    let meme;
    if (memeType === 'GeneratedImage') {
      meme = await GeneratedImage.findById(memeId);
    } else {
      meme = await Meme.findById(memeId);
    }
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    if (meme.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only set your own memes as premium' });
    }
    
    // Calculate commission
    const commission = isPremium ? (price * settings.commissionRate / 100) : 0;
    
    meme.isPremium = isPremium;
    meme.price = isPremium ? price : 0;
    meme.commission = commission;
    
    await meme.save();
    
    res.json({ 
      message: `Meme ${isPremium ? 'set as premium' : 'removed from premium'} successfully`,
      meme 
    });
  } catch (error) {
    console.error('Error setting premium meme:', error);
    res.status(500).json({ message: 'Failed to set premium meme' });
  }
};

// Get premium memes
export const getPremiumMemes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, sort = 'createdAt' } = req.query;
    
    const premiumMemes = await Meme.find({ isPremium: true, is_public: true })
      .populate('user', 'username profileImage')
      .sort({ [sort as string]: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const premiumGeneratedImages = await GeneratedImage.find({ isPremium: true, is_public: true })
      .populate('user', 'username profileImage')
      .sort({ [sort as string]: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const allPremiumMemes = [
      ...premiumMemes.map(meme => ({ ...meme.toObject(), memeType: 'Meme' })),
      ...premiumGeneratedImages.map(img => ({ ...img.toObject(), memeType: 'GeneratedImage' }))
    ];
    
    res.json({ memes: allPremiumMemes });
  } catch (error) {
    console.error('Error getting premium memes:', error);
    res.status(500).json({ message: 'Failed to get premium memes' });
  }
};

// Purchase premium meme
export const purchasePremiumMeme = async (req: AuthRequest, res: Response) => {
  try {
    const { memeId, memeType } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    let meme;
    if (memeType === 'GeneratedImage') {
      meme = await GeneratedImage.findById(memeId).populate('user', 'username');
    } else {
      meme = await Meme.findById(memeId).populate('user', 'username');
    }
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    if (!meme.isPremium) {
      return res.status(400).json({ message: 'This meme is not premium' });
    }
    
    if (meme.user.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot purchase your own meme' });
    }
    
    // Check if user already purchased this meme
    const existingTransaction = await Transaction.findOne({
      buyer: req.user.id,
      memeId: memeId,
      memeType: memeType,
      status: 'completed'
    });
    
    if (existingTransaction) {
      return res.status(400).json({ message: 'You have already purchased this meme' });
    }
    
    // Create transaction
    const transaction = new Transaction({
      buyer: req.user.id,
      seller: meme.user._id,
      memeId: memeId,
      memeType: memeType,
      price: meme.price || 0,
      commission: meme.commission || 0,
      sellerEarnings: (meme.price || 0) - (meme.commission || 0),
      platformEarnings: meme.commission || 0,
      status: 'completed',
      paymentMethod: 'platform_credit'
    });
    
    await transaction.save();
    
    // Update meme stats
    meme.soldCount = (meme.soldCount || 0) + 1;
    meme.totalEarnings = (meme.totalEarnings || 0) + ((meme.price || 0) - (meme.commission || 0));
    await meme.save();
    
    res.json({ 
      message: 'Premium meme purchased successfully',
      transaction,
      meme: {
        ...meme.toObject(),
        memeType
      }
    });
  } catch (error) {
    console.error('Error purchasing premium meme:', error);
    res.status(500).json({ message: 'Failed to purchase premium meme' });
  }
};

// Get user's purchased memes
export const getPurchasedMemes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const transactions = await Transaction.find({
      buyer: req.user.id,
      status: 'completed'
    }).populate('seller', 'username');
    
    const purchasedMemes = [];
    
    for (const transaction of transactions) {
      let meme;
      if (transaction.memeType === 'GeneratedImage') {
        meme = await GeneratedImage.findById(transaction.memeId);
      } else {
        meme = await Meme.findById(transaction.memeId);
      }
      
      if (meme) {
        purchasedMemes.push({
          ...meme.toObject(),
          memeType: transaction.memeType,
          purchaseDate: transaction.transactionDate,
          purchasePrice: transaction.price
        });
      }
    }
    
    res.json({ memes: purchasedMemes });
  } catch (error) {
    console.error('Error getting purchased memes:', error);
    res.status(500).json({ message: 'Failed to get purchased memes' });
  }
};

// Get creator's premium meme earnings
export const getCreatorEarnings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const transactions = await Transaction.find({
      seller: req.user.id,
      status: 'completed'
    });
    
    const totalEarnings = transactions.reduce((sum, t) => sum + t.sellerEarnings, 0);
    const totalSales = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + t.price, 0);
    
    res.json({
      totalEarnings,
      totalSales,
      totalRevenue,
      transactions: transactions.slice(0, 10) // Last 10 transactions
    });
  } catch (error) {
    console.error('Error getting creator earnings:', error);
    res.status(500).json({ message: 'Failed to get creator earnings' });
  }
}; 