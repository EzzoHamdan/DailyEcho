// /api/quotes.js

const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

// MongoDB client setup
let db;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDb() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    // Ensure indexes are created
    await db.collection('quotes').createIndex({ _id: 1 });
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}

// Connect to the database once at startup
connectToDb().catch(console.error);

// CORS handling
const corsMiddleware = cors();

const handler = async (req, res) => {
  try {
    const db = await connectToDb();
    const quotesCollection = db.collection('quotes');

    corsMiddleware(req, res, async () => {
      if (req.method === 'GET') {
        try {
          const { id } = req.query; // Get the id query parameter

          let quotes;
          if (id) {
            // Handle multiple ids (if they are comma-separated)
            const idsArray = id.split(',').map(Number); // Split by comma and convert to numbers
            quotes = await quotesCollection.find({ _id: { $in: idsArray } }).toArray();
          } else {
            // Fetch all quotes when no id is specified
            quotes = await quotesCollection.find({}).toArray();
          }

          res.status(200).json(quotes);
        } catch (err) {
          console.error('Error fetching quotes:', err);
          res.status(500).json({ error: 'Failed to fetch quotes' });
        }
      } else if (req.method === 'POST') {
        try {
          const newQuote = req.body; // Expecting a JSON payload
          await quotesCollection.insertOne(newQuote);
          res.status(201).json(newQuote);
        } catch (err) {
          console.error('Error adding new quote:', err);
          res.status(500).json({ error: 'Failed to add new quote' });
        }
      } else {
        res.status(405).json({ error: 'Method Not Allowed' });
      }
    });
  } catch (err) {
    console.error('Error in handler:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
