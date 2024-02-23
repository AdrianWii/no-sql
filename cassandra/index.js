const express = require('express');
const cassandra = require('cassandra-driver');

const app = express();

// Ustawienie połączenia z bazą danych Cassandra
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'], // Adresy IP klastrów Cassandra
  localDataCenter: 'datacenter1', // Nazwa lokalnego centrum danych
  keyspace: 'example_keyspace' // Nazwa przestrzeni kluczy
});

// Endpoint do pobierania danych z bazy danych Cassandra
app.get('/data', async (req, res) => {
  try {
    const query = 'SELECT * FROM example_table'; // Zapytanie do pobrania danych
    const result = await client.execute(query);
    res.json(result.rows); // Zwrócenie danych w formacie JSON
  } catch (err) {
    console.error(err);
    res.status(500).send('Wystąpił błąd podczas pobierania danych');
  }
});

// Uruchomienie serwera na porcie 3000
app.listen(3000, () => {
  console.log('Serwer działa na porcie 3000');
});
