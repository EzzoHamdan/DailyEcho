// /api/config.js

require('dotenv').config(); // Load environment variables

const config = {
  basePort: process.env.PORT
};

export default (req, res) => {
  try {
    res.status(200).json(config);
  } catch (error) {
    console.error('Error fetching config', error);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
};
