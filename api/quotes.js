const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

let db;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDb() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    await db.collection('quotes').createIndex({ _id: 1, type: 1 });
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}

connectToDb().catch(console.error);

const corsMiddleware = cors();

const handler = async (req, res) => {
  try {
    const start = Date.now();
    
    corsMiddleware(req, res, async () => {
      if (req.method === 'GET') {
        const { id } = req.query;

        try {
          const db = await connectToDb();
          const quotesCollection = db.collection('quotes');
          let quotes = [];

          if (id) {
            const idsArray = id.split(',').map(Number);
            quotes = await quotesCollection
              .find({ _id: { $in: idsArray } })
              .project({ quotes: 1 })
              .maxTimeMS(2000)
              .toArray();
          } else {
            quotes = await quotesCollection
              .find({})
              .project({ quotes: 1 })
              .maxTimeMS(2000)
              .toArray();
          }

          if (quotes && quotes.length > 0) {
            const formattedQuotes = quotes.map(q => ({
              ...q,
              quotes: Array.isArray(q.quotes) ? q.quotes : []
            }));
            console.log(`Query completed in ${Date.now() - start}ms`);
            return res.status(200).json(formattedQuotes);
          } else {
            return res.status(404).json({ error: 'No quotes found' });
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
      }

      return res.status(405).json({ error: 'Method Not Allowed' });
    });
  } catch (err) {
    console.error('Critical error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
