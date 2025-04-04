const express = require('express');
const router = express.Router();
const qrController = require('../../controllers/qrController');
const { protect, checkEventOwnership } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimiter');

router.use(apiLimiter);

router.get('/:eventId', qrController.getEventQR);

router.use(protect);

router.post('/:eventId', 
  checkEventOwnership({ idField: 'eventId' }),
  qrController.generateEventQR
);

module.exports = router;