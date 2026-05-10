const express = require('express');
const router = express.Router();
const LandRecord = require('../models/LandRecord');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Public Statistics for Home Page
router.get('/public-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalLands = await LandRecord.countDocuments({ status: 'approved' });

    // Aggregate total area (simplified sum for the home page display)
    const areaAggregate = await LandRecord.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: "$area.value" } } }
    ]);

    const totalArea = areaAggregate.length > 0 ? areaAggregate[0].total : 0;
    const approvalCount = await LandRecord.countDocuments({ status: 'approved' });
    const allCount = await LandRecord.countDocuments();
    const precision = 99.9; // Fixed high-precision value for marketing

    res.json({
      areaMeasured: totalArea,
      surveyors: totalUsers,
      approvalRate: allCount > 0 ? ((approvalCount / allCount) * 100).toFixed(1) : 0,
      precision,
      totalRecords: allCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Create Land Record
router.post('/', protect, upload.array('documents'), async (req, res) => {
  try {
    const { title, description, coordinates, area, unit, surveyMode } = req.body;

    // Handle area as either an object {value, unit} or separate fields
    const areaValue = area?.value !== undefined ? area.value : area;
    const areaUnit = area?.unit || unit || 'sq.meter';

    // Parse coordinates and area if they come as strings (due to form-data)
    const parsedCoordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
    const parsedAreaValue = typeof areaValue === 'string' ? parseFloat(areaValue) : areaValue;

    const documents = req.files ? req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`
    })) : [];

    const landRecord = await LandRecord.create({
      user: req.user._id,
      title,
      description,
      coordinates: parsedCoordinates,
      area: {
        value: parsedAreaValue,
        unit: areaUnit
      },
      documents,
      surveyMode: surveyMode || 'manual'
    });

    res.status(201).json(landRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User's Land Records
router.get('/my-lands', protect, async (req, res) => {
  try {
    const lands = await LandRecord.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(lands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Land Record
router.get('/:id', protect, async (req, res) => {
  try {
    const land = await LandRecord.findById(req.params.id);
    if (!land) return res.status(404).json({ message: 'Land record not found' });

    // Check if user is owner or admin
    if (land.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(land);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Land Record
router.delete('/:id', protect, async (req, res) => {
  try {
    const land = await LandRecord.findById(req.params.id);
    if (!land) return res.status(404).json({ message: 'Land record not found' });

    if (land.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await LandRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Land record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
