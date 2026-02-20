import Bin from '../../../models/Bin';
import { connectDB } from '../../../lib/db';

export async function getBins(req, res) {
  try {
    await connectDB();

    const { category, status, latitude, longitude, maxDistance = 50000 } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    // Geospatial query for nearby bins
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

    res.status(200).json({
      success: true,
      count: bins.length,
      data: bins
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function createBin(req, res) {
  try {
    await connectDB();

    const { locationName, coordinates, category, capacity, status } = req.body;

    if (!locationName || !coordinates || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide locationName, coordinates, and category'
      });
    }

    const bin = await Bin.create({
      locationName,
      coordinates: {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]] // GeoJSON expects [longitude, latitude]
      },
      latitude: coordinates[0],
      longitude: coordinates[1],
      category,
      capacity: capacity || 0,
      status: status || 'active',
      lastServiceDate: new Date()
    });

    res.status(201).json({
      success: true,
      data: bin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function getBinById(req, res) {
  try {
    await connectDB();

    const { id } = req.query;
    const bin = await Bin.findById(id);

    if (!bin) {
      return res.status(404).json({
        success: false,
        error: 'Bin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function updateBin(req, res) {
  try {
    await connectDB();

    const { id } = req.query;
    const { locationName, category, capacity, status } = req.body;

    let bin = await Bin.findById(id);

    if (!bin) {
      return res.status(404).json({
        success: false,
        error: 'Bin not found'
      });
    }

    if (locationName) bin.locationName = locationName;
    if (category) bin.category = category;
    if (capacity !== undefined) bin.capacity = capacity;
    if (status) bin.status = status;
    bin.updatedAt = new Date();

    bin = await bin.save();

    res.status(200).json({
      success: true,
      data: bin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function deleteBin(req, res) {
  try {
    await connectDB();

    const { id } = req.query;
    const bin = await Bin.findByIdAndDelete(id);

    if (!bin) {
      return res.status(404).json({
        success: false,
        error: 'Bin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bin deleted successfully',
      data: bin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function updateBinCapacity(req, res) {
  try {
    await connectDB();

    const { id } = req.query;
    const { capacity } = req.body;

    if (capacity === undefined || capacity < 0 || capacity > 100) {
      return res.status(400).json({
        success: false,
        error: 'Capacity must be between 0 and 100'
      });
    }

    let bin = await Bin.findById(id);

    if (!bin) {
      return res.status(404).json({
        success: false,
        error: 'Bin not found'
      });
    }

    bin.capacity = capacity;
    bin.updatedAt = new Date();

    // Update status based on capacity
    if (capacity >= 85) {
      bin.status = 'full';
    } else if (capacity < 85 && bin.status === 'full') {
      bin.status = 'active';
    }

    bin = await bin.save();

    res.status(200).json({
      success: true,
      data: bin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function getStatistics(req, res) {
  try {
    await connectDB();

    const totalBins = await Bin.countDocuments();
    const activeBins = await Bin.countDocuments({ status: 'active' });
    const fullBins = await Bin.countDocuments({ status: 'full' });
    const binsByCategory = await Bin.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    const averageCapacity = await Bin.aggregate([
      {
        $group: {
          _id: null,
          avgCapacity: { $avg: '$capacity' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBins,
        activeBins,
        fullBins,
        binsByCategory,
        averageCapacity: averageCapacity[0]?.avgCapacity || 0
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}
