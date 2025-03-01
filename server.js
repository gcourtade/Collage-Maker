require('dotenv').config();

const mongoose = require('mongoose');
const fixieData = process.env.FIXIE_SOCKS_SOCKS_HOST.split(new RegExp('[/(:\\/@/]+'));
const express = require('express');
const bodyParser = require('body-parser');
const uuidv4 = require('uuid').v4;
const app = express();

console.log("Connecting to:", process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, {
    proxyUsername: fixieData[0],
    proxyPassword: fixieData[1],
    proxyHost: fixieData[2],
    proxyPort: fixieData[3]
   })
   .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });


const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Successfully connected to MongoDB!");
});

const collectionSchema = new mongoose.Schema({
    id: String,
    images: [{
        src: String,
        position: {
            top: String,
            left: String
        }
    }]
});

const Collection = mongoose.model('Collection', collectionSchema);


let collections = [];

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/saveCollection', async (req, res) => {
    const tokenId = req.body.tokenId;
    const images = req.body.images;

    let collection = await Collection.findOne({ id: tokenId });
    
    if (collection) {
        collection.images = images;
        await collection.save();
    } else {
        collection = new Collection({
            id: tokenId,
            images: images
        });
        await collection.save();
    }
    res.json({ id: tokenId });
});


app.get('/loadCollection', async (req, res) => {
    const tokenId = req.query.id;
    const collection = await Collection.findOne({ id: tokenId });

    if (collection) {
        res.json(collection);
    } else {
        res.status(404).json({ error: 'Collection not found' });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
    });
});

