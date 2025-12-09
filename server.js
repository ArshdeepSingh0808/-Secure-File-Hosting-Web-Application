const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./backend/config/db.js');

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'FILE-HOSTING/frontend')));

app.use('/api', require('./backend/routes/authRoutes'));
app.use('/api', require('./backend/routes/fileRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'FILE-HOSTING/frontend', 'login.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));