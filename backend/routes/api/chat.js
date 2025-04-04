const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const { protect, checkEventOwnership } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimiter');

router.use(apiLimiter);

router.get('/event/:eventId', chatController.getEventMessages);

router.post('/event/:eventId', chatController.sendMessage);

router.use(protect);

router.get('/stats/:eventId',
  checkEventOwnership({ idField: 'eventId' }),
  chatController.getChatStats
);

module.exports = router;