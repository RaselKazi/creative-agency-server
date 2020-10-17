const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();


//mongo DB info
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7pro1.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('orders'));
app.use(fileUpload());


client.connect(err => {

    const ordersCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.ORDERS_COLLECTION}`);
    //admin data base
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.ADMIN_COLLECTION}`);
    //services data base
    const servicesCollectiona = client.db(`${process.env.DB_NAME}`).collection(`${process.env.SERVICES_COLLECTION}`);
    //reviews data base
    const reviewsCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.REVIEWS_COLLECTION}`);

    app.post('/addAdminEmail', (req, res) => {
        const adminEmail = req.body;
        adminCollection.insertOne(adminEmail)
        .then(() => {
            res.json({ success: true })
        })

    })

   

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;

        const newImg = file.data;
        const encordImg = newImg.toString('base64');

        const icon = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encordImg, 'base64')
        };

        servicesCollectiona.insertOne({title, description, icon})
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/allServices', (req, res) => {
        servicesCollectiona.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.post('/addOrder', (req, res) => {
        const orderInfo = req.body;

        ordersCollection.insertOne(orderInfo)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })
  
});


app.listen(process.env.PORT || 5000)