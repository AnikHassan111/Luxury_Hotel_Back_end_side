const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://hotelroomuser:kcR6HdvPRal0Cjcc@cluster0.wnl4pp8.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const hotelViewPicCollection = client
      .db("MyHotel")
      .collection("hotelviewpic");
    const RoomPage = client.db("MyHotel").collection("roomCollection");
    const RoomBooking = client.db("MyHotel").collection("booking");

    //Room Page Api
    app.get("/room", async (req, res) => {
      const result = await RoomPage.find().toArray();
      res.send(result);
    });

    app.get("/roomshowDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await RoomPage.findOne(query);
      res.send(result);
    });

    //Hotel Booking
    app.post("/bookign", async (req, res) => {
      const body = req.body;
      const result = await RoomBooking.insertOne(body);
      res.send(result);
    });

    app.get("/getbooking", async (req, res) => {
      const result = await RoomBooking.find().toArray();
      res.send(result);
    });
    //Hotel view Pic Start
    app.get("/hotelviewpic", async (req, res) => {
      const result = await hotelViewPicCollection.find().toArray();
      res.send(result);
    });

    //Hotel view Pic End

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Running");
});

app.listen(port, () => {
  console.log("Server is runnring");
});
