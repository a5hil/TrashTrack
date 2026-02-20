# Backend API Documentation

## Overview
This is a modular backend system for the TrashTrack waste management application built with Next.js and MongoDB.

## Architecture

### Directory Structure
```
app/
  api/
    bins/
      route.js         # Main API endpoint handler
lib/
  db.js               # MongoDB connection utility
  api.js              # Frontend API service
models/
  Bin.js              # MongoDB schema and model
controllers/
  binController.js    # Business logic for bin operations
```

## Database Schema

### Bin Model
```javascript
{
  locationName: String,           // Name of the location
  coordinates: {
    type: Point,                  // GeoJSON Point for geospatial queries
    coordinates: [longitude, latitude]
  },
  latitude: Number,               // Stored for convenience
  longitude: Number,              // Stored for convenience
  category: String,               // Enum: General Waste, Recyclable, Organic, Hazardous, E-waste, Medical
  status: String,                 // Enum: active, inactive, full, maintenance (default: active)
  capacity: Number,               // 0-100 percentage
  lastServiceDate: Date,          // When the bin was last serviced
  isActive: Boolean,              // Whether bin is operational
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/bins
```

### 1. Get All Bins
```
GET /api/bins
```

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `latitude` (optional): For geospatial queries
- `longitude` (optional): For geospatial queries
- `maxDistance` (optional): Max distance in meters (default: 50000)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "locationName": "Central Park",
      "coordinates": {
        "type": "Point",
        "coordinates": [77.2090, 28.6139]
      },
      "category": "Recyclable",
      "capacity": 85,
      "status": "full",
      "createdAt": "2024-02-20T10:00:00Z"
    }
  ]
}
```

### 2. Create a Bin
```
POST /api/bins
```

**Request Body:**
```json
{
  "locationName": "Central Park",
  "coordinates": [28.6139, 77.2090],
  "category": "Recyclable",
  "capacity": 45,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### 3. Get Bin by ID
```
GET /api/bins?id={binId}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### 4. Update Bin
```
PUT /api/bins?id={binId}
```

**Request Body:**
```json
{
  "locationName": "Updated Name",
  "status": "maintenance",
  "capacity": 50
}
```

### 5. Update Bin Capacity
```
PUT /api/bins?id={binId}&capacity=true
```

**Request Body:**
```json
{
  "capacity": 90
}
```

**Note:** If capacity >= 85%, status automatically changes to 'full'

### 6. Delete Bin
```
DELETE /api/bins?id={binId}
```

**Response:**
```json
{
  "success": true,
  "message": "Bin deleted successfully",
  "data": { ... }
}
```

### 7. Get Statistics
```
GET /api/bins?stats=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBins": 25,
    "activeBins": 20,
    "fullBins": 5,
    "binsByCategory": [
      {
        "_id": "Recyclable",
        "count": 8
      }
    ],
    "averageCapacity": 65.5
  }
}
```

## Frontend API Service

The `lib/api.js` file provides a convenient service to interact with the backend:

```javascript
import { binAPI } from '@/lib/api';

// Get all bins
const bins = await binAPI.getBins();

// Get bins with filters
const recyclableBins = await binAPI.getBins({ category: 'Recyclable' });

// Create a bin
await binAPI.createBin({
  locationName: 'Central Park',
  coordinates: [28.6139, 77.2090],
  category: 'Recyclable'
});

// Update capacity
await binAPI.updateBinCapacity(binId, 85);

// Delete a bin
await binAPI.deleteBin(binId);

// Get statistics
const stats = await binAPI.getStatistics();
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://trashtrack:trashtrack@cluster0.tmag7xb.mongodb.net/?appName=Cluster0
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Features

✅ **CRUD Operations**: Full Create, Read, Update, Delete functionality
✅ **Geospatial Queries**: Find bins near a location
✅ **Automatic Status Updates**: Status changes based on capacity
✅ **Statistics**: Get dashboard statistics
✅ **Error Handling**: Comprehensive error responses
✅ **Validation**: Input validation on all endpoints
✅ **CORS Support**: Cross-origin requests enabled
✅ **Timestamps**: Automatic createdAt and updatedAt tracking
✅ **Modular Architecture**: Separated controllers, models, and routes

## Integration with Frontend

Update your dashboard to use the API service:

```javascript
import { binAPI } from '@/lib/api';

// In your useEffect
useEffect(() => {
  const fetchBins = async () => {
    try {
      const response = await binAPI.getBins();
      setBins(response.data);
    } catch (error) {
      console.error('Error fetching bins:', error);
    }
  };
  fetchBins();
}, []);

// When adding a bin
const handleAddBin = async (values) => {
  try {
    const response = await binAPI.createBin({
      locationName: values.locationName,
      coordinates: selectedCoordinates,
      category: values.category
    });
    // Update state with response
    setBins([...bins, response.data]);
  } catch (error) {
    message.error('Failed to add bin');
  }
};
```

## Security Notes

⚠️ **Important**: The MongoDB URI and API should be protected in production:
- Use environment variables for sensitive data
- Implement authentication middleware
- Add rate limiting
- Use HTTPS
- Add input validation and sanitization
- Implement role-based access control

## Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## Testing with cURL

```bash
# Create a bin
curl -X POST http://localhost:3000/api/bins \
  -H "Content-Type: application/json" \
  -d '{"locationName":"Park","coordinates":[28.6139,77.2090],"category":"Recyclable"}'

# Get all bins
curl http://localhost:3000/api/bins

# Get statistics
curl "http://localhost:3000/api/bins?stats=true"
```
