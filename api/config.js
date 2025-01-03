const express = require('express');
const router = express.Router();
require('dotenv').config(); // Load environment variables

// Configuration data from environment variables
const config = {
  basePort: process.env.BASE_PORT
};

router.get('/', (req, res) => {
  res.json(config);
});

module.exports = router;
