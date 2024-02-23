const express = require('express');
const { Client } = require('@elastic/elasticsearch');

const app = express();
const esClient = new Client({ node: 'http://localhost:9200' });

app.use(express.json());

// Endpoint POST do dodawania filmów
app.post('/movies', async (req, res) => {
  try {
    const { title, release, director, rating } = req.body;
    const response = await esClient.index({
      index: 'movies',
      body: {
        title,
        release,
        director,
        rating
      }
    });
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Wystąpił błąd podczas dodawania filmu' });
  }
});

// Endpoint POST do wyszukiwania filmów
app.post('/movies/search', async (req, res) => {
  try {
    const { query } = req.body;
    const response = await esClient.search({
      index: 'movies',
      body: {
        query
      }
    });
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Wystąpił błąd podczas wyszukiwania filmów' });
  }
});

// Start serwera na porcie 3000
app.listen(3000, () => {
  console.log('Serwer działa na porcie 3000');
});
