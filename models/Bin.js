import mongoose from 'mongoose';

const BinSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: [true, 'Please provide a location name'],
      trim: true,
      maxlength: [100, 'Location name cannot be more than 100 characters']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function(v) {
            return v && v.length === 2 && 
                   typeof v[0] === 'number' && typeof v[1] === 'number' &&
                   v[0] >= -180 && v[0] <= 180 && 
                   v[1] >= -90 && v[1] <= 90;
          },
          message: 'Coordinates must be [longitude, latitude] with valid ranges'
        }
      }
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    category: {
      type: String,
      enum: ['General Waste', 'Recyclable', 'Organic', 'Hazardous', 'E-waste', 'Medical'],
      required: [true, 'Please select a bin category']
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'full', 'maintenance'],
      default: 'active'
    },
    capacity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastServiceDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true  // Automatically handles createdAt and updatedAt
  }
);

// Create geospatial index
BinSchema.index({ 'coordinates.coordinates': '2dsphere' });

// Update the latitude and longitude fields before saving
BinSchema.pre('save', async function(next) {
  try {
    if (this.coordinates && this.coordinates.coordinates && Array.isArray(this.coordinates.coordinates)) {
      this.longitude = this.coordinates.coordinates[0];
      this.latitude = this.coordinates.coordinates[1];
    }
    next();
  } catch (error) {
    console.error('Pre-save hook error:', error);
    next(error);
  }
});

const Bin = mongoose.models.Bin || mongoose.model('Bin', BinSchema);

export default Bin;
