const express = require('express');
const router = express.Router();
const alertController = require('../../controllers/alertController');
const { protect, checkEventOwnership } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimiter');

router.use(protect);

router.use(apiLimiter);

router.get('/event/:eventId',
  checkEventOwnership({ idField: 'eventId' }),
  alertController.getEventAlerts
);

router.get('/event/:eventId/count',
  checkEventOwnership({ idField: 'eventId' }),
  alertController.getActiveAlertCount
);

router.get('/:alertId',
  alertController.getAlertById
);

router.put('/:alertId/status',
  alertController.updateAlertStatus
);

router.put('/:alertId/assign',
  alertController.assignAlert
);

router.post('/:alertId/notes',
  alertController.addAlertNote
);

router.post('/',
  alertController.createAlert
);

router.put('/:alertId',
  alertController.updateAlert
);

router.delete('/:alertId',
  alertController.deleteAlert
);

router.get('/types',
  alertController.getAlertTypes
);

router.get('/severity/:severity',
  alertController.getAlertsBySeverity
);

router.post('/resolve-multiple',
  alertController.resolveMultipleAlerts
);

module.exports = router;