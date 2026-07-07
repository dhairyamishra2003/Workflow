const notificationService = require('../services/notificationService');

async function listNotifications(req, res, next) {
  try {
    const list = await notificationService.listNotifications(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listNotifications,
  markRead,
  markAllRead,
};
