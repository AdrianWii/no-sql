const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');

const app = express();
app.use(cors());

const port = 3000;

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('your_username', 'your_password'));
const session = driver.session();

app.get('/movies', async (req, res) => {
  try {
    const result = await session.run('MATCH (m:Movie) RETURN m');
    const movies = result.records.map(record => record.get('m').properties);
    res.json(movies);
  } catch (error) {
    console.error('Error retrieving movies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});
