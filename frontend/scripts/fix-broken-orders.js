const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://togtoh:Random011021@cluster0.rds2ass.mongodb.net/menu';

async function fixBrokenOrders() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const ordersCollection = db.collection('orders');
    
    console.log('\n🔍 Checking for orders with missing menuItem references...');
    
    // Find orders with items that have null/undefined menuItem
    const brokenOrders = await ordersCollection.find({
      "items.menuItem": { $exists: false }
    }).toArray();
    
    if (brokenOrders.length === 0) {
      console.log('✅ No orders with missing menuItem references found!');
      return;
    }
    
    console.log(`❌ Found ${brokenOrders.length} orders with missing menuItem references:`);
    
    let fixedCount = 0;
    
    for (const order of brokenOrders) {
      console.log(`\n📋 Order #${order.orderNumber} (Table ${order.table?.number || 'Unknown'}):`);
      
      const brokenItems = order.items.filter(item => !item.menuItem);
      const validItems = order.items.filter(item => item.menuItem);
      
      console.log(`   - Total items: ${order.items.length}`);
      console.log(`   - Valid items: ${validItems.length}`);
      console.log(`   - Broken items: ${brokenItems.length}`);
      
      if (brokenItems.length > 0) {
        console.log('   - Broken items details:');
        brokenItems.forEach((item, index) => {
          console.log(`     ${index + 1}. Quantity: ${item.quantity}, Price: $${item.price}, menuItem: ${item.menuItem}`);
        });
        
        // Ask user what to do with broken items
        console.log('\n💡 Options for broken items:');
        console.log('   1. Remove broken items (recommended)');
        console.log('   2. Keep broken items (will show warnings in UI)');
        console.log('   3. Skip this order');
        
        // For now, let's remove broken items automatically
        const updatedItems = order.items.filter(item => item.menuItem);
        const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (updatedItems.length !== order.items.length) {
          try {
            const result = await ordersCollection.updateOne(
              { _id: order._id },
              { 
                $set: { 
                  items: updatedItems,
                  total: updatedTotal
                } 
              }
            );
            
            if (result.modifiedCount > 0) {
              console.log(`   ✅ Fixed: Removed ${brokenItems.length} broken items, updated total to $${updatedTotal.toFixed(2)}`);
              fixedCount++;
            }
          } catch (error) {
            console.error(`   ❌ Error fixing order:`, error.message);
          }
        }
      }
    }
    
    console.log(`\n🎉 Fix completed!`);
    console.log(`   ✅ Fixed: ${fixedCount} orders`);
    console.log(`   📊 Total broken orders found: ${brokenOrders.length}`);
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const remainingBrokenOrders = await ordersCollection.find({
      "items.menuItem": { $exists: false }
    }).toArray();
    
    if (remainingBrokenOrders.length === 0) {
      console.log('✅ All orders now have valid menuItem references!');
    } else {
      console.log(`⚠️  Still have ${remainingBrokenOrders.length} orders with issues`);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
fixBrokenOrders().catch(console.error); 