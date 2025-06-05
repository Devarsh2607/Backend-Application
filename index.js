const express = require('express');
const mongoose = require('mongoose');
const cors=require('cors');
const List = require('./models/List');
const Item = require('./models/Item');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const authenticateToken = require('./middleware/auth'); // adjust the path if needed


const JWT_SECRET = 'your_secret_key'; // Later move this to a .env file


const app = express();
app.use(cors());
app.use(express.json());

// Replace with your connection string
const MONGO_URI = 'mongodb+srv://f20230465:devarsh%40262910@cluster0.krdxvdi.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

/* ---------- LIST ROUTES ---------- */

// Create a to-do list
app.post('/lists',authenticateToken, async (req, res) => {
  const list = new List({ name: req.body.name });
  await list.save();
  res.status(201).json(list);
});

// Edit a list's name
app.put('/lists/:id',authenticateToken, async (req, res) => {
  const list = await List.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
  list ? res.json(list) : res.status(404).send('List not found');
});

// Delete a list and its items
app.delete('/lists/:id',authenticateToken, async (req, res) => {
  await Item.deleteMany({ listId: req.params.id });
  const result = await List.findByIdAndDelete(req.params.id);
  result ? res.sendStatus(204) : res.status(404).send('List not found');
});

// Get all lists
app.get('/lists',authenticateToken, async (req, res) => {
  const lists = await List.find();
  res.json(lists);
});

/* ---------- ITEM ROUTES ---------- */

// Create an item under a list
app.post('/lists/:listId/items',authenticateToken, async (req, res) => {
  const item = new Item({ title: req.body.title, completed: false, listId: req.params.listId });
  await item.save();
  res.status(201).json(item);
});

// Get one item by ID
app.get('/items/:itemId',authenticateToken, async (req, res) => {
  const item = await Item.findById(req.params.itemId);
  item ? res.json(item) : res.status(404).send('Item not found');
});

// Get all items in a list
app.get('/lists/:listId/items',authenticateToken, async (req, res) => {
  const items = await Item.find({ listId: req.params.listId });
  res.json(items);
});

// Get all items
app.get('/items',authenticateToken, async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Update an item
app.put('/items/:itemId',authenticateToken, async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
  item ? res.json(item) : res.status(404).send('Item not found');
});

// Delete an item
app.delete('/items/:itemId',authenticateToken, async (req, res) => {
  const result = await Item.findByIdAndDelete(req.params.itemId);
  result ? res.sendStatus(204) : res.status(404).send('Item not found');
});

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
/* ---------- USER AUTHENTICATION ---------- */
// Register
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).send('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.status(201).send('User registered successfully');
});

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).send('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send('Invalid credentials');

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});
  



