const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

async function createNotification({ owner, workflow, execution, type, title, message }) {
  try {
    const notification = new Notification({
      owner,
      workflow,
      execution,
      type,
      title,
      message,
    });
    await notification.save();

    // Broadcast through socket to let the operator see the red dot trigger on AppShell immediately
    const io = getIO();
    if (io) {
      io.to(`user:${owner}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

async function listNotifications(userId) {
  try {
    return await Notification.find({ owner: userId }).sort({ createdAt: -1 });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

async function markAsRead(notificationId, userId) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, owner: userId },
      { read: true },
      { new: true }
    );
    if (!notification) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }
    return notification;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

async function markAllAsRead(userId) {
  try {
    await Notification.updateMany({ owner: userId, read: false }, { read: true });
    return { success: true };
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

module.exports = {
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
};
