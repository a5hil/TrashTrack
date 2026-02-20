import { connectDB } from '@/lib/db';
import WasteReport from '@/models/WasteReport';

// Helper function to calculate distance between two coordinates (Haversine formula)
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const radius = parseInt(searchParams.get('radius') || '200'); // Default 200 meters

    // Get all waste hotspot reports
    const reports = await WasteReport.find({
      reportType: 'waste_hotspot',
      status: 'pending'
    })
      .sort({ reportedAt: -1 })
      .lean();

    if (reports.length === 0) {
      return Response.json({
        success: true,
        data: [],
        clusteredData: []
      });
    }

    // Cluster reports by proximity
    const clusteredReports = [];
    const processedReports = new Set();

    for (let i = 0; i < reports.length; i++) {
      if (processedReports.has(i)) continue;

      const cluster = [reports[i]];
      processedReports.add(i);

      // Find all reports within radius
      for (let j = i + 1; j < reports.length; j++) {
        if (processedReports.has(j)) continue;

        const distance = getDistanceInMeters(
          reports[i].coordinates.latitude,
          reports[i].coordinates.longitude,
          reports[j].coordinates.latitude,
          reports[j].coordinates.longitude
        );

        if (distance <= radius) {
          cluster.push(reports[j]);
          processedReports.add(j);
        }
      }

      // Calculate cluster center
      const centerLat = cluster.reduce((sum, r) => sum + r.coordinates.latitude, 0) / cluster.length;
      const centerLon = cluster.reduce((sum, r) => sum + r.coordinates.longitude, 0) / cluster.length;

      // Determine priority
      let priority = 'low';
      if (cluster.length >= 3) priority = 'high';
      else if (cluster.length >= 2) priority = 'medium';

      clusteredReports.push({
        priority,
        reportCount: cluster.length,
        coordinates: {
          latitude: centerLat,
          longitude: centerLon
        },
        reports: cluster,
        clusterRadius: radius
      });
    }

    // Sort by priority and report count
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    clusteredReports.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.reportCount - a.reportCount;
    });

    return Response.json({
      success: true,
      data: reports,
      clusteredData: clusteredReports
    });
  } catch (error) {
    console.error('Error fetching waste reports:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
