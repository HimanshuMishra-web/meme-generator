const mongoose = require('mongoose');
const Meme = require('./src/models/Meme');
const GeneratedImage = require('./src/models/GeneratedImage');
const Transaction = require('./src/models/Transaction');
const User = require('./src/models/User');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meme-generator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAnalytics() {
  try {
    console.log('Testing Analytics API...');
    
    // Test date range function
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    console.log('Date ranges:');
    console.log('Today:', { start: startOfDay, end: now });
    console.log('Week:', { start: startOfWeek, end: now });
    console.log('Month:', { start: startOfMonth, end: now });
    
    // Test database queries
    const dateFilter = {
      createdAt: {
        $gte: new Date(0),
        $lte: now
      }
    };
    
    console.log('\nDatabase counts:');
    const memeCount = await Meme.countDocuments(dateFilter);
    const aiCount = await GeneratedImage.countDocuments(dateFilter);
    const transactionCount = await Transaction.countDocuments({ ...dateFilter, status: 'completed' });
    const userCount = await User.countDocuments(dateFilter);
    
    console.log('Memes:', memeCount);
    console.log('AI Generated:', aiCount);
    console.log('Transactions:', transactionCount);
    console.log('Users:', userCount);
    
    // Test aggregation queries
    console.log('\nTesting aggregation queries...');
    
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
    
    console.log('Meme stats:', memeStats);
    
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
    
    console.log('Transaction stats:', transactionStats);
    
    console.log('\n✅ Analytics test completed successfully!');
    
  } catch (error) {
    console.error('❌ Analytics test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAnalytics(); 