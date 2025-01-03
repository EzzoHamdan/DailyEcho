const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config(); // Load environment variables

const port = process.env.PORT;
// MongoDB connection URL and database name
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
// Middleware
app.use(express.json());
app.use(cors()); // Allow cross-origin requests from frontend
// MongoDB client setup
let db;
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('Failed to connect to MongoDB', err));
// Route to get quotes from the MongoDB collection
app.get('/quotes', async (req, res) => {
  try {
    const { type } = req.query; // Get the type query parameter

    const quotesCollection = db.collection('quotes');
    let quotes;

    if (type) {
      // Fetch quotes filtered by type
      const typesArray = type.split(',').map(Number);
      quotes = await quotesCollection.find({ type: { $in: typesArray } }).toArray();
    } else {
      // Fetch all quotes when no type is specified
      quotes = await quotesCollection.find({}).toArray();
    }

    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

const path = require('path');

const configRouter = require('./api/config');

// Serve static files (like the HTML, CSS, JS)
app.use('/api/config', configRouter);
app.use(express.static(path.join(__dirname, 'public')));
// Root route to serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); 
});
// Route to insert new quote (if needed)
app.post('/quotes', async (req, res) => {
  try {
    const newQuote = req.body; // Expecting a JSON payload
    const quotesCollection = db.collection('quotes');
    await quotesCollection.insertOne(newQuote);
    res.status(201).json(newQuote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add new quote' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port: http://localhost:${port}`);
});