const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./auth_db');
const adminRoutes = require('./admin_routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Backend API running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
