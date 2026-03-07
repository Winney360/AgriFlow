import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('listingId', 'title productType price')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};
