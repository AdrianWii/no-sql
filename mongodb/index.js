const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

// Connection URI
const uri = 'mongodb://mongodb:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
client.connect().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Create Express app
const app = express();
app.use(cors());

// List all movies
app.get('/movies', async (req, res) => {
    try {
        const db = client.db('movies');
        const movies = await db.collection('movies').find().toArray();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get movie by ID with its reviews
app.get('/movies/:id', async (req, res) => {
    try {
        const db = client.db('movies');
        const movie = await db.collection('movies').aggregate([
            {
                $match: { _id: new ObjectId(req.params.id) }
            },
            {
                $lookup: {
                    from: 'reviews', // Assuming 'reviews' is the name of the reviews collection
                    localField: '_id',
                    foreignField: 'movieId',
                    as: 'reviews'
                }
            }
        ]).toArray();

        if (!movie.length) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.json(movie[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
