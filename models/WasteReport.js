import mongoose from 'mongoose';

const WasteReportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required']
    },
    binId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bin',
      required: false
    },
    reportType: {
      type: String,
      enum: ['bin_disposal', 'waste_hotspot'],
      default: 'bin_disposal'
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'resolved', 'rejected'],
      default: 'pending'
    },
    wasteType: {
      type: String,
      enum: ['General Waste', 'Recyclable', 'Organic', 'Hazardous', 'E-waste', 'Medical', 'waste_hotspot'],
      required: false,
      default: 'waste_hotspot'
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than 0'],
      max: [1000, 'Quantity cannot exceed 1000 kg']
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs', 'pieces', 'liters'],
      default: 'kg'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    photo: {
      type: String, // URL to photo if provided
    },
    creditsEarned: {
      type: Number,
      default: 0,
      min: 0
    },
    binLocation: {
      type: String,
      required: false,
      default: 'Custom Location'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: String,
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
WasteReportSchema.index({ userId: 1 });
WasteReportSchema.index({ binId: 1 });
WasteReportSchema.index({ reportedAt: -1 });

export default mongoose.models.WasteReport || mongoose.model('WasteReport', WasteReportSchema);
