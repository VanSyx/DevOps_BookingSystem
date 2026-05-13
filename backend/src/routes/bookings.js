const router = require('express').Router();
const ctrl = require('../controllers/bookingController');

router.get('/', ctrl.getAll);
router.get('/stats', ctrl.stats);
router.get('/customers', ctrl.customers);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.patch('/:id/status', ctrl.setStatus);
router.patch('/:id/cancel', ctrl.cancel);
router.delete('/:id', ctrl.remove);

module.exports = router;
