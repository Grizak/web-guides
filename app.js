const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();

// Models
const Guide = require('./models/Guide');
const Admin = require('./models/Admin');

const SECRET_KEY = process.env.JWT_SECRET;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', 'views');

mongoose
.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


// Middleware to check authentication
const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.redirect('/login');
      req.admin = decoded;
      next();
  });
};

// Routes
app.get('/', async (req, res) => {
  try {
      const guides = await Guide.find(); // Fetch all guides
      res.render('index', { guides });
  } catch (err) {
      console.error(err);
      res.status(500).render('500');
  }
});

app.get('/guides/:name', async (req, res) => {
  try {
    const guide = await Guide.findOne({ name: req.params.name });
    if (guide) {
      res.render('guide', { guide })
    } else {
      res.status(404).render('404');
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('500');
  }
});

app.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const guides = await Guide.find();
    res.render('admin', { guides });
  } catch (err) {
    console.error(err);
    res.status(500).render('500');
  }
});

app.post('/admin/add', authenticateAdmin, async (req, res) => {
  const { name, title, content } = req.body;
  try {
      const guide = new Guide({ name, title, content });
      await guide.save();
      res.redirect('/admin');
  } catch (err) {
      console.error(err);
      res.status(500).send('Error adding guide');
  }
});

app.get('/admin/edit/:id', authenticateAdmin, async (req, res) => {
  try {
      const guide = await Guide.findById(req.params.id);
      res.render('edit', { guide });
  } catch (err) {
      res.status(404).send('Guide not found');
  }
});

app.post('/admin/edit/:id', authenticateAdmin, async (req, res) => {
  const { name, title, content } = req.body;
  try {
      await Guide.findByIdAndUpdate(req.params.id, { name, title, content });
      res.redirect('/admin');
  } catch (err) {
      console.error(err);
      res.status(500).send('Error updating guide');
  }
});

app.post('/admin/delete/:id', authenticateAdmin, async (req, res) => {
  try {
      await Guide.findByIdAndDelete(req.params.id);
      res.redirect('/admin');
  } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting guide');
  }
});


// Admin Login Page
app.get('/login', (req, res) => {
  res.render('login'); // Render a simple login form
});

// Handle Admin Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
      const admin = await Admin.findOne({ username });
      if (!admin || !(await admin.comparePassword(password))) {
          return res.status(401).send('Invalid credentials');
      }

      const token = jwt.sign({ id: admin._id, username: admin.username }, SECRET_KEY, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/admin');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

// Admin Logout
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
