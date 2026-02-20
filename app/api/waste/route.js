import { connectDB } from '@/lib/db';
import WasteReport from '@/models/WasteReport';

// Credit calculation based on waste type and quantity
function calculateCredits(wasteType, quantity) {
  const creditRates = {
    'General Waste': 1, // 1 credit per kg
    'Recyclable': 3, // 3 credits per kg (higher because recyclable is more valuable)
    'Organic': 2, // 2 credits per kg
    'Hazardous': 5, // 5 credits per kg (more difficult to dispose)
    'E-waste': 4, // 4 credits per kg (valuable materials)
    'Medical': 4 // 4 credits per kg (specialized handling)
  };

  const rate = creditRates[wasteType] || 1;
  return Math.round(quantity * rate * 10) / 10; // Round to 1 decimal place
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const reports = await WasteReport.find({ userId })
      .sort({ reportedAt: -1 })
      .populate('binId', 'locationName category');

    return Response.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching waste reports:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      userId,
      binId,
      wasteType,
      quantity,
      unit = 'kg',
      description,
      binLocation,
      coordinates,
      photo
    } = body;

    // Validate common required fields
    if (!userId || !quantity) {
      return Response.json(
        {
          success: false,
          message: 'Missing required fields: userId, quantity'
        },
        { status: 400 }
      );
    }

    // Determine report type
    const reportType = binId ? 'bin_disposal' : 'waste_hotspot';

    // For bin disposal, wasteType is required
    if (reportType === 'bin_disposal' && !wasteType) {
      return Response.json(
        {
          success: false,
          message: 'Missing required field: wasteType for disposal reports'
        },
        { status: 400 }
      );
    }

    // Validate specific fields based on report type
    if (reportType === 'bin_disposal' && !binLocation) {
       return Response.json(
        { success: false, message: 'Bin location is required for disposal reports' },
        { status: 400 }
      );
    }

    if (reportType === 'waste_hotspot' && (!coordinates || !coordinates.latitude || !coordinates.longitude)) {
      return Response.json(
        { success: false, message: 'Coordinates are required for waste hotspot reports' },
        { status: 400 }
      );
    }

    // Validate waste type only for bin disposal
    if (reportType === 'bin_disposal') {
      const validWasteTypes = ['General Waste', 'Recyclable', 'Organic', 'Hazardous', 'E-waste', 'Medical'];
      if (!validWasteTypes.includes(wasteType)) {
        return Response.json(
          { success: false, message: 'Invalid waste type' },
          { status: 400 }
        );
      }
    }

    // Calculate credits (only for verified bin disposal)
    // For hotspots, credits are 0 until maybe verified by admin? 
    // Let's keep it 0 for now to prevent abuse.
    const creditsEarned = reportType === 'bin_disposal' ? calculateCredits(wasteType, quantity) : 0;

    // Create waste report
    const wasteReport = new WasteReport({
      userId,
      binId: binId || undefined,
      reportType,
      status: 'pending',
      wasteType,
      quantity,
      unit,
      description,
      binLocation: binLocation || 'Custom Location',
      coordinates,
      photo,
      creditsEarned
    });

    await wasteReport.save();

    return Response.json(
      {
        success: true,
        message: reportType === 'bin_disposal' ? 'Waste disposal reported!' : 'Waste hotspot reported!',
        data: wasteReport,
        creditsEarned
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating waste report:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Get waste reports statistics for a user
export async function PUT(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { reportId } = body;

    if (!reportId) {
      return Response.json(
        { success: false, message: 'Report ID is required' },
        { status: 400 }
      );
    }

    const report = await WasteReport.findByIdAndUpdate(
      reportId,
      { verified: true, verifiedAt: new Date() },
      { new: true }
    );

    if (!report) {
      return Response.json(
        { success: false, message: 'Report not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Report verified successfully',
      data: report
    });
  } catch (error) {
    console.error('Error updating waste report:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
