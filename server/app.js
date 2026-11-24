
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRoutes = require('./routes/healthRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const examinationRoutes = require('./routes/examinationRoutes');
const roomRoutes = require('./routes/roomRoutes');
const facultyAvailabilityRoutes = require('./routes/facultyAvailabilityRoutes');
const roomAllocationRoutes = require('./routes/roomAllocationRoutes');
const dutyAllocationRoutes = require('./routes/dutyAllocationRoutes');


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/health', healthRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/examinations', examinationRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/faculty-availability', facultyAvailabilityRoutes);
app.use('/api/room-allocations', roomAllocationRoutes);
app.use('/api/duty-allocations', dutyAllocationRoutes);




app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Exam Roster Management Backend'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = app;
