
const express = require('express');
const router = express.Router();

const {
  allocateExamRooms,
  getRoomAllocations
} = require('../controllers/roomAllocationController');

router.post('/:examinationId/allocate', allocateExamRooms);
router.get('/:examinationId', getRoomAllocations);

module.exports = router;
