
const express = require('express');
const router = express.Router();

const {
  getExaminations,
  addExamination,
  updateExamination,
  deleteExamination
} = require('../controllers/examinationController');

router.get('/', getExaminations);
router.post('/', addExamination);
router.put('/:id', updateExamination);
router.delete('/:id', deleteExamination);

module.exports = router;
