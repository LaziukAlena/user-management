const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; 

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});



