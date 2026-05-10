const router = require('express').Router();
const ctrl = require('../controllers/bookingController');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.patch('/:id/cancel', ctrl.cancel);

module.exports = router;