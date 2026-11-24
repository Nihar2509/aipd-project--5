
const express = require('express');
const router = express.Router();

const {
  generateDutyAllocation,
  getDutyAllocations
} = require('../controllers/dutyAllocationController');

router.post('/:examinationId/generate', generateDutyAllocation);

router.get('/:examinationId', getDutyAllocations);

module.exports = router;
