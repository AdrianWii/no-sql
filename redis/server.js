const express = require('express');
const redis = require('redis');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(cors());

const port = 3000;

const client = redis.createClient({ host: 'redis' });

app.get('/photos', async (req, res) => {
    const albumId = req.query.albumId;
    
    client.get('photos', async function(err, reply) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving data from Redis');
        } 
        
        if(reply != null) {
            return res.json(JSON.parse(reply))
        }
        
        const { data } = await axios.get(
            "https://jsonplaceholder.typicode.com/photos",
            { params: { albumId } }
        )
        client.setex("photos", 3600, JSON.stringify(data));
        return res.json(data)
    });
});

app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});
