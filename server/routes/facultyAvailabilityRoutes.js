
const express = require('express');
const router = express.Router();

const {
  getAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability
} = require('../controllers/availabilityController');

router.get('/', getAvailability);
router.post('/', addAvailability);
router.put('/:id', updateAvailability);
router.delete('/:id', deleteAvailability);

module.exports = router;
