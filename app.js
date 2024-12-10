const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const cookieparser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

// Models
const Guide = require('./models/Guide');
const Admin = require('./models/Admin');
const Category = require('./models/Category');

const SECRET_KEY = process.env.JWT_SECRET;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(cookieparser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use((req, res, next) => {
    try {
        const token = req.cookies.token || null; // Use `req.cookies` for retrieving cookies
        if (token) {
            res.locals.admin = jwt.verify(token, SECRET_KEY);
        } else {
            res.locals.admin = null; // No token, no admin
        }
    } catch (err) {
        console.error('Error verifying token:', err.message);
        res.locals.admin = null; // Invalid token
    }
    next();
});

// Middleware to check authentication
const authenticateAdmin = (req, res, next) => {
  // return next();
  try {
    const token = req.cookies.token || null;
    if (!token) return res.redirect('/login');

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.redirect('/login');
        req.admin = decoded;
        next();
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An unexpected error occured" })
  }
};

// Routes
app.get('/', async (req, res) => {
  const { search, category } = req.query;

  const filter = {};
  if (search) {
    filter.title = { $regex: search, $options: 'i' }; // Case-insensitive search
  }
  if (category) {
    filter.category = category;
  }

  try {
    const guides = await Guide.find(filter).populate('category');

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
    const categories = await Category.find();
    res.render('admin', { guides, categories });
  } catch (err) {
    console.error(err);
    res.status(500).render('500');
  }
});

app.post('/admin/add', authenticateAdmin, async (req, res) => {
  try {
    const { name, title, author, category } = req.body;

    const newGuide = new Guide({
      name,
      title,
      author,
      category
    });

    await newGuide.save();
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).render('500');
  }
})

app.get('/admin/edit/:id', authenticateAdmin, async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id).populate("category");
    const categories = await Category.find(); // To allow updating the category
    res.render('edit', { guide, categories });
  } catch (err) {
    console.error(err);
    res.status(404).render('404', { message: "Guide not found" });
  }
});

app.post('/admin/edit/:id', authenticateAdmin, async (req, res) => {
  const { name, title, category } = req.body;

  try {
      // Parse sections
      const sections = Object.keys(req.body)
          .filter(key => key.startsWith('sections['))
          .reduce((acc, key) => {
              const match = key.match(/sections\[(\d+)\]\.(.+)/);
              if (match) {
                  const [, index, field] = match;
                  acc[index] = acc[index] || {};
                  acc[index][field] = req.body[key];
              }
              return acc;
          }, []);

      const updatedSections = sections.map((section, index) => ({
          id: section.id || `section-${Date.now()}-${index}`,
          title: section.title,
          content: section.content,
      }));

      await Guide.findByIdAndUpdate(req.params.id, {
          name,
          title,
          category,
          sections: updatedSections,
      });

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

app.post('/admin/categories/add', authenticateAdmin, async (req, res) => {
  const { name, description } = req.body;

  try {
      const category = new Category({ name, description });
      await category.save();
      res.redirect('/admin');
  } catch (err) {
      console.error(err);
      res.status(500).send('Error creating category');
  }
});


// Admin Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const { name, password } = req.body;

    // Ensure name and password are provided
    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }

    const newAdmin = new Admin({
      name,
      password
    });

    await newAdmin.save();
    res.status(200).redirect('/login');
  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({ message: "Name already exists" });
    }
    
    console.error(err);
    res.status(500).json({ message: "Registration Falied" });
  }
});

// Handle Admin Login
app.post('/login', async (req, res) => {
  const { name, password } = req.body;
  try {
      const admin = await Admin.findOne({ name });
      if (!admin) return res.status(401).send("Invalid username");

      if (!(await admin.comparePassword(password))) return res.status(401).send('Invalid password');

      const token = jwt.sign({ id: admin._id, name: admin.name }, SECRET_KEY, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/admin');
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

// Admin Logout
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

app.all('*', (req, res) => {
  res.render('404');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
