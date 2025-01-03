// /api/quotes.js

const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

// MongoDB client setup
let db;

async function connectToDb() {
  if (db) return db;
  try {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}

const handler = async (req, res) => {
  const db = await connectToDb();
  const quotesCollection = db.collection('quotes');

  // CORS handling (You can also use Vercel's default CORS handling)
  cors()(req, res, async () => {
    if (req.method === 'GET') {
      try {
        const { type } = req.query; // Get the type query parameter

        let quotes;
        if (type) {
          // Fetch quotes filtered by type
          const typesArray = type.split(',').map(Number);
          quotes = await quotesCollection.find({ type: { $in: typesArray } }).toArray();
        } else {
          // Fetch all quotes when no type is specified
          quotes = await quotesCollection.find({}).toArray();
        }

        res.status(200).json(quotes);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch quotes' });
      }
    } else if (req.method === 'POST') {
      try {
        const newQuote = req.body; // Expecting a JSON payload
        await quotesCollection.insertOne(newQuote);
        res.status(201).json(newQuote);
      } catch (err) {
        res.status(500).json({ error: 'Failed to add new quote' });
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  });
};

export default handler;
