const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all notifications for user
router.get('/', auth, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(notifications);
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );
  res.json(notification);
});

// Create notification (for testing or admin)
router.post('/', auth, async (req, res) => {
  const notification = new Notification({ ...req.body, user: req.user.id });
  await notification.save();
  res.json(notification);
});

module.exports = router;
