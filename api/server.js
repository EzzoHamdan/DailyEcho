const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://devezzham:AvD45l20L35kJ1Zw@dailyechocluster.ik19k.mongodb.net/';
const dbName = 'quotesDB';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  cachedDb = client.db(dbName);
  return cachedDb;
}

export default async function handler(req, res) {
  const db = await connectToDatabase();
  const quotesCollection = db.collection('quotes');

  if (req.method === 'GET') {
    try {
      const { type } = req.query;
      const filter = type ? { type: parseInt(type) } : {};
      const quotes = await quotesCollection.find(filter).toArray();
      res.status(200).json(quotes);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  } else if (req.method === 'POST') {
    try {
      const newQuote = req.body;
      await quotesCollection.insertOne(newQuote);
      res.status(201).json(newQuote);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add new quote' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
