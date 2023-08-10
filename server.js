const express = require('express');
const bodyParser = require('body-parser');
const uuidv4 = require('uuid').v4;
const app = express();

let collections = [];

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/saveCollection', (req, res) => {
    // console.log("Received request to save collection with tokenId:", req.body.tokenId);
    const tokenId = req.body.tokenId;
    const images = req.body.images;

    if (tokenId) {
        // Find the collection using the tokenId
        let collection = collections.find(c => c.id === tokenId);
        
        // If it exists, update it
        if (collection) {
            collection.images = images;
        } else {
            // If it doesn't exist, create a new one
            collections.push({
                id: tokenId,
                images: images
            });
        }
        res.json({ id: tokenId });
    } else {
        // If tokenId is not provided, handle it appropriately, maybe send an error response
        res.status(400).send("tokenId is missing");
    }
});



app.get('/loadCollection', (req, res) => {
    let tokenId = req.query.id;
    let collection = collections.find(c => c.id === tokenId);

    if (collection) {
        res.json(collection);
    } else {
        res.status(404).json({ error: 'Collection not found' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
