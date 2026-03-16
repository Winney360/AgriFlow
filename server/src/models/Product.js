import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    productType: {
      type: String,
      enum: ['crop', 'livestock', 'grain', 'vegetable', 'fruit'],
      required: true,
    },
    quantity: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imageUrls: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 4,
        message: 'A listing can have at most 4 photos',
      },
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      locationName: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'inactive'],
      default: 'active',
    },
    pathAccessibility: {
      type: String,
      enum: ['open', 'flooded', 'trucks_only'],
      default: 'open',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

productSchema.index({ title: 'text', 'location.locationName': 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
