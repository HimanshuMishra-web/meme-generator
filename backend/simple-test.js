const mongoose = require('mongoose');

// Connect to database
mongoose.connect('mongodb://localhost:27017/meme_generator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function simpleTest() {
  try {
    console.log('Testing database connection...');
    
    // Wait for connection
    await mongoose.connection.asPromise();
    console.log('✅ Connected to MongoDB');
    
    // Check if collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check data counts
    const Meme = mongoose.model('Meme', new mongoose.Schema({}));
    const GeneratedImage = mongoose.model('GeneratedImage', new mongoose.Schema({}));
    const Transaction = mongoose.model('Transaction', new mongoose.Schema({}));
    const User = mongoose.model('User', new mongoose.Schema({}));
    
    const memeCount = await Meme.countDocuments();
    const aiCount = await GeneratedImage.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('\nData counts:');
    console.log('Memes:', memeCount);
    console.log('AI Generated:', aiCount);
    console.log('Transactions:', transactionCount);
    console.log('Users:', userCount);
    
    if (memeCount === 0 && aiCount === 0 && transactionCount === 0 && userCount === 0) {
      console.log('\n⚠️  No data found in database. You may need to seed the database first.');
      console.log('Run: npm run seed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

simpleTest(); 