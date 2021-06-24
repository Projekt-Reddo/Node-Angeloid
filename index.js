require('dotenv').config();
const express = require('express');
const cors = require('cors');

app = express();
app.use(express.json());
app.use(cors());

const animeController = require('./controllers/animeController');

app.get('/api/anime', animeController.getLater);

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Listening on port ${port}`));