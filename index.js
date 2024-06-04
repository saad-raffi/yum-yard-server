const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


// Middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c1qkd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // database & collections 
    const menuCollections = client.db("demo-food-client").collection("menus"); 
    const cartCollections = client.db("demo-food-client").collection("cartItems");
    
    // all menu items operations 
    app.get('/menu', async(req, res) => { 
      const result = await menuCollections.find().toArray(); 
      res.send(result);
    });

    // posting cart to db
    app.post('/carts', async(req, res) => {
      const cartItem = req.body;
      const result = await cartCollections.insertOne(cartItem); 
      res.send(result);
    });

    // get carts using email
    app.get('/carts', async(req, res) => { 
      const email = req.query.email;
      const filter = { email: email };
      const result = await cartCollections.find(filter).toArray(); 
      res.send(result);
    });

    // Delete items from carts
    app.delete('/carts/:id', async(req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ObjectId' });
      }

      const filter = { _id: new ObjectId(id) };
      const result = await cartCollections.deleteOne(filter); 

      if (result.deletedCount === 0) {
        return res.status(404).send({ error: 'Item not found' });
      }

      res.send(result); 
    });

    // Fetch all menu items
    app.get('/menus', async (req, res) => {
      const result = await menuCollections.find().toArray();
      res.send(result);
    });

    // Update a menu item
    app.put('/menus/:id', async (req, res) => {
      const id = req.params.id;
      const updatedItem = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: updatedItem.name,
          quantity: updatedItem.quantity,
          image: updatedItem.image,
          price: updatedItem.price,
        },
      };
      const result = await menuCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Delete a menu item
    app.delete('/menus/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await menuCollections.deleteOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  } 
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
