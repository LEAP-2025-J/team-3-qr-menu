const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

// Define a simple schema for testing
const TestSchema = new mongoose.Schema({
  name: String,
  value: Number
});

const TestModel = mongoose.model('Test', TestSchema);

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');
    
    // Test inserting a document
    const testDoc = new TestModel({ name: 'test', value: 123 });
    await testDoc.save();
    console.log('Inserted test document');
    
    // Test finding documents
    const docs = await TestModel.find({});
    console.log('Found documents:', docs.length);
    
    // Clean up
    await TestModel.deleteMany({});
    console.log('Cleaned up test documents');
    
    await mongoose.disconnect();
    console.log('Disconnected successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection(); 