import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from 'cors';

const app = express();


app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't match an API route, send back React's index.html
app.get('/*', (req, res, next) => {
  if (req.path.includes('/:')) {
    return res.status(400).send('Malformed URL');
  }

  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});
const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
