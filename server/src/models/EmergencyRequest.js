import mongoose from 'mongoose';

const emergencyRequestSchema = new mongoose.Schema(
  {
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
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      required: true,
      trim: true,
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
    },
    radius: {
      type: Number,
      default: 50,
      description: 'Search radius in km for nearby farmers',
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimedBy: [
      {
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        quantity: String,
        claimedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'completed'],
          default: 'pending',
        },
      },
    ],
    status: {
      type: String,
      enum: ['open', 'partially_fulfilled', 'fulfilled', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['normal', 'high', 'critical'],
      default: 'high',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

emergencyRequestSchema.index({ title: 'text', description: 'text' });
emergencyRequestSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

const EmergencyRequest = mongoose.model('EmergencyRequest', emergencyRequestSchema);

export default EmergencyRequest;
