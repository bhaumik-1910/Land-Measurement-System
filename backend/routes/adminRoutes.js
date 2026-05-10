const express = require('express');
const router = express.Router();
const LandRecord = require('../models/LandRecord');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// Get all land records
router.get('/lands', protect, admin, async (req, res) => {
  try {
    const lands = await LandRecord.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(lands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject land record
router.patch('/lands/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const land = await LandRecord.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!land) return res.status(404).json({ message: 'Land record not found' });
    res.json(land);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard Analytics
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalLands = await LandRecord.countDocuments();
    const approvedLands = await LandRecord.countDocuments({ status: 'approved' });
    const pendingLands = await LandRecord.countDocuments({ status: 'pending' });

    // Aggregate area by unit (optional, for advanced analytics)
    const stats = await LandRecord.aggregate([
      {
        $group: {
          _id: '$area.unit',
          totalArea: { $sum: '$area.value' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalUsers,
      totalLands,
      approvedLands,
      pendingLands,
      areaStats: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Don't delete admins via this route
    if (user.role === 'admin') return res.status(401).json({ message: 'Cannot delete admin' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle user lock status
router.patch('/users/:id/lock', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role === 'admin') return res.status(401).json({ message: 'Cannot lock admin' });

    user.isLocked = !user.isLocked;
    await user.save();
    
    res.json({ message: `User ${user.isLocked ? 'locked' : 'unlocked'} successfully`, isLocked: user.isLocked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
