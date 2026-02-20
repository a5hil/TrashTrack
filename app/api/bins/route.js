import { connectDB } from '@/lib/db';
import Bin from '@/models/Bin';
import { NextResponse } from 'next/server';

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// Handle preflight requests
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const stats = searchParams.get('stats');
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const maxDistance = searchParams.get('maxDistance') || 50000;

    // Get statistics
    if (stats === 'true') {
      const totalBins = await Bin.countDocuments();
      const activeBins = await Bin.countDocuments({ status: 'active' });
      const fullBins = await Bin.countDocuments({ status: 'full' });
      const binsByCategory = await Bin.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      const averageCapacity = await Bin.aggregate([
        { $group: { _id: null, avgCapacity: { $avg: '$capacity' } } }
      ]);

      return NextResponse.json({
        success: true,
        data: {
          totalBins,
          activeBins,
          fullBins,
          binsByCategory,
          averageCapacity: averageCapacity[0]?.avgCapacity || 0
        }
      }, { headers: corsHeaders });
    }

    // Get single bin by ID
    if (id) {
      const bin = await Bin.findById(id);
      if (!bin) {
        return NextResponse.json({ success: false, error: 'Bin not found' }, { status: 404, headers: corsHeaders });
      }
      return NextResponse.json({ success: true, data: bin }, { headers: corsHeaders });
    }

    // Get all bins with optional filters
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    if (latitude && longitude) {
      query['coordinates.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      };
    }

    const bins = await Bin.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: bins.length,
      data: bins
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400, headers: corsHeaders });
  }
}

export async function POST(req) {
  try {
    console.log('POST /api/bins - Connecting to DB...');
    await connectDB();
    console.log('Database connected');

    const body = await req.json();
    console.log('Request body received:', body);
    
    const { locationName, coordinates, category, capacity, status } = body;

    // Validate required fields
    if (!locationName || !coordinates || !category) {
      const missingFields = [];
      if (!locationName) missingFields.push('locationName');
      if (!coordinates) missingFields.push('coordinates');
      if (!category) missingFields.push('category');
      
      console.log('Missing required fields:', missingFields);
      return NextResponse.json(
        { success: false, error: `Please provide: ${missingFields.join(', ')}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate coordinates format
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      console.log('Invalid coordinates format:', coordinates);
      return NextResponse.json(
        { success: false, error: 'Coordinates must be [latitude, longitude]' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate coordinate values
    const [lat, lng] = coordinates;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.log('Coordinates are not numbers:', { lat, lng });
      return NextResponse.json(
        { success: false, error: 'Coordinates must be numbers' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.log('Coordinates out of range:', { lat, lng });
      return NextResponse.json(
        { success: false, error: 'Invalid coordinate values (lat: -90 to 90, lng: -180 to 180)' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Creating bin with validated data:', { locationName, category, coordinates });
    
    const bin = await Bin.create({
      locationName,
      coordinates: {
        type: 'Point',
        coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
      },
      latitude: lat,
      longitude: lng,
      category,
      capacity: capacity || 0,
      status: status || 'active'
    });

    console.log('Bin created successfully:', bin._id);
    return NextResponse.json({ success: true, data: bin }, { status: 201, headers: corsHeaders });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.entries(error.errors).map(([field, err]) => ({
        field,
        message: err.message
      }));
      console.error('Mongoose validation error:', validationErrors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed: ' + validationErrors.map(e => e.message).join(', ')
        }, 
        { status: 400, headers: corsHeaders }
      );
    }

    console.error('POST error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create bin'
      }, 
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const capacity = searchParams.get('capacity');
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Bin ID required' }, { status: 400, headers: corsHeaders });
    }

    let bin = await Bin.findById(id);
    if (!bin) {
      return NextResponse.json({ success: false, error: 'Bin not found' }, { status: 404, headers: corsHeaders });
    }

    // Update capacity only
    if (capacity === 'true') {
      if (body.capacity === undefined || body.capacity < 0 || body.capacity > 100) {
        return NextResponse.json({ success: false, error: 'Invalid capacity' }, { status: 400, headers: corsHeaders });
      }
      bin.capacity = body.capacity;
      if (body.capacity >= 85) {
        bin.status = 'full';
      } else if (body.capacity < 85 && bin.status === 'full') {
        bin.status = 'active';
      }
    } else {
      // Update other fields
      if (body.locationName) bin.locationName = body.locationName;
      if (body.category) bin.category = body.category;
      if (body.capacity !== undefined) bin.capacity = body.capacity;
      if (body.status) bin.status = body.status;
    }

    bin.updatedAt = new Date();
    bin = await bin.save();

    return NextResponse.json({ success: true, data: bin }, { headers: corsHeaders });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Bin ID required' }, { status: 400, headers: corsHeaders });
    }

    const bin = await Bin.findByIdAndDelete(id);

    if (!bin) {
      return NextResponse.json({ success: false, error: 'Bin not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({
      success: true,
      message: 'Bin deleted successfully',
      data: bin
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400, headers: corsHeaders });
  }
}
