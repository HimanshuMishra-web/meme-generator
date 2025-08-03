import { connectDB } from './config/db';
import Meme from './models/Meme';
import GeneratedImage from './models/GeneratedImage';
import User from './models/User';
import Transaction from './models/Transaction';

const seedAnalyticsData = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Create sample users
    const users = await User.create([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'premium'
      },
      {
        username: 'admin_user',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      }
    ]);

    console.log('Created users:', users.length);

    // Create sample memes
    const memes = await Meme.create([
      {
        url: 'https://example.com/meme1.jpg',
        title: 'Funny Meme 1',
        description: 'A hilarious meme',
        is_public: true,
        isPremium: false,
        publicationStatus: 'approved',
        user: users[0]._id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        url: 'https://example.com/meme2.jpg',
        title: 'Premium Meme 1',
        description: 'A premium meme',
        is_public: true,
        isPremium: true,
        price: 5.99,
        commission: 0.60,
        soldCount: 3,
        totalEarnings: 16.17,
        publicationStatus: 'approved',
        user: users[1]._id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        url: 'https://example.com/meme3.jpg',
        title: 'Private Meme',
        description: 'A private meme',
        is_public: false,
        isPremium: false,
        publicationStatus: 'private',
        user: users[0]._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        url: 'https://example.com/meme4.jpg',
        title: 'Pending Meme',
        description: 'A pending meme',
        is_public: true,
        isPremium: false,
        publicationStatus: 'pending',
        user: users[1]._id,
        createdAt: new Date()
      }
    ]);

    console.log('Created memes:', memes.length);

    // Create sample AI generated images
    const aiImages = await GeneratedImage.create([
      {
        url: 'https://example.com/ai1.jpg',
        title: 'AI Generated 1',
        description: 'An AI generated image',
        prompt: 'A funny cat meme',
        style: 'cartoon',
        modelUsed: 'DALL-E',
        is_public: true,
        isPremium: false,
        publicationStatus: 'approved',
        user: users[0]._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        url: 'https://example.com/ai2.jpg',
        title: 'Premium AI Generated',
        description: 'A premium AI generated image',
        prompt: 'A professional meme template',
        style: 'realistic',
        modelUsed: 'Midjourney',
        is_public: true,
        isPremium: true,
        price: 8.99,
        commission: 0.90,
        soldCount: 2,
        totalEarnings: 16.08,
        publicationStatus: 'approved',
        user: users[1]._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        url: 'https://example.com/ai3.jpg',
        title: 'Rejected AI Generated',
        description: 'A rejected AI generated image',
        prompt: 'A controversial meme',
        style: 'abstract',
        modelUsed: 'Stable Diffusion',
        is_public: false,
        isPremium: false,
        publicationStatus: 'rejected',
        rejectionReason: 'Inappropriate content',
        user: users[0]._id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      }
    ]);

    console.log('Created AI generated images:', aiImages.length);

    // Create sample transactions
    const transactions = await Transaction.create([
      {
        buyer: users[0]._id,
        seller: users[1]._id,
        memeId: memes[1]._id.toString(),
        memeType: 'Meme',
        price: 5.99,
        commission: 0.60,
        sellerEarnings: 5.39,
        platformEarnings: 0.60,
        status: 'completed',
        transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        paymentMethod: 'credit_card'
      },
      {
        buyer: users[0]._id,
        seller: users[1]._id,
        memeId: memes[1]._id.toString(),
        memeType: 'Meme',
        price: 5.99,
        commission: 0.60,
        sellerEarnings: 5.39,
        platformEarnings: 0.60,
        status: 'completed',
        transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        paymentMethod: 'credit_card'
      },
      {
        buyer: users[1]._id,
        seller: users[0]._id,
        memeId: aiImages[1]._id.toString(),
        memeType: 'GeneratedImage',
        price: 8.99,
        commission: 0.90,
        sellerEarnings: 8.09,
        platformEarnings: 0.90,
        status: 'completed',
        transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        paymentMethod: 'paypal'
      },
      {
        buyer: users[0]._id,
        seller: users[1]._id,
        memeId: aiImages[1]._id.toString(),
        memeType: 'GeneratedImage',
        price: 8.99,
        commission: 0.90,
        sellerEarnings: 8.09,
        platformEarnings: 0.90,
        status: 'completed',
        transactionDate: new Date(),
        paymentMethod: 'credit_card'
      }
    ]);

    console.log('Created transactions:', transactions.length);

    console.log('✅ Analytics seed data created successfully!');
    console.log('📊 Sample data includes:');
    console.log('- 3 users (1 regular, 1 premium, 1 admin)');
    console.log('- 4 memes (1 public, 1 premium, 1 private, 1 pending)');
    console.log('- 3 AI generated images (1 public, 1 premium, 1 rejected)');
    console.log('- 4 transactions');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding analytics data:', error);
    process.exit(1);
  }
};

seedAnalyticsData(); 