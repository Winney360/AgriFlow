import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: {
      type: String,
      default: null,
    },
    phoneVerificationExpiresAt: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['buyer', 'seller'],
      default: 'buyer',
    },
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
    locationName: {
      type: String,
      default: '',
      trim: true,
    },
    locationVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

const User = mongoose.model('User', userSchema);

export default User;
