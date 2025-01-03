// /api/index.js

import path from 'path';
import fs from 'fs';

export default (req, res) => {
  const requestedPath = req.url === '/' ? 'index.html' : req.url;
  const filePath = path.join(process.cwd(), 'public', requestedPath); // Adjust path for Vercel's file structure

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send('File not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.send(data);
  });
};
