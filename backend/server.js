const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Placeholder)
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_pm_system')
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// Routes
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/', (req, res) => {
  res.send('AI PM System API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
