import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: true,
    trim: true
  },
  nameMn: {
    type: String,
    required: true,
    trim: true
  },
  descriptionEn: {
    type: String,
    required: true,
    trim: true
  },
  descriptionMn: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  categoryNameEn: {
    type: String,
    required: true,
    enum: ['appetizers', 'sushi', 'ramen', 'mains', 'desserts', 'drinks']
  },
  categoryNameMn: {
    type: String,
    required: true,
    enum: ['завсрын хоол', 'суши', 'рамен', 'үндсэн хоол', 'амттан', 'ундаа']
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  allergens: [{
    type: String,
    enum: ['nuts', 'dairy', 'gluten', 'seafood', 'eggs', 'soy']
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  }
}, {
  timestamps: true
});

// Index үүсгэх хайлтыг хурдасгахын тулд
menuItemSchema.index({ nameEn: 'text', nameMn: 'text', descriptionEn: 'text', descriptionMn: 'text' });
menuItemSchema.index({ categoryNameEn: 1 });
menuItemSchema.index({ isAvailable: 1 });

export default mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
