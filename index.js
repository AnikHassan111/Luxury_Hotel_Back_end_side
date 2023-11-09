const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;

// middleware

app.use(
  cors({
    origin: [
      "https://assigment-11-hotelroom-project.web.app",
      "https://assigment-11-hotelroom-project.firebaseapp.com",
      "https://assigment-11-hotelroom-project.web.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//jwt User Varify

const VarifyTo = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).send({ status: "unAuthorized Accsess", code: "401" });
    return;
  }
  jwt.verify(token, process.env.TOKEN, (err, decode) => {
    if (err) {
      res.status(401).send({ status: "unAuthorized Accsess", code: "401" });
      return;
    } else {
      req.decode = decode;
      next();
    }
  });
};

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
    const FeaturedRoom = client.db("MyHotel").collection("featuredroom");

    //Jwt Function
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    app.post("/jwt", async (req, res) => {
      const body = req.body;
      const token = jwt.sign(body, process.env.TOKEN, { expiresIn: "48hr" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          expires: expirationDate,
        })
        .send({ message: "Success", token });
    });
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

    app.put("/updateDate/:id", async (req, res) => {
      const date = req.body;
      const id = req.params.id;
      const query = { _id: id };
      const updateDoc = {
        $set: {
          bookingDate: date.date,
        },
      };
      const options = { upsert: true };
      const result = await RoomBooking.updateOne(query, updateDoc, options);
      res.send(result);
    });
    app.get("/getbooking", VarifyTo, async (req, res) => {
      const email = req.query.email;

      const option = { userEmail: email };
      const result = await RoomBooking.find(option).toArray();
      res.send(result);
    });

    app.get("/booknowsection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await RoomPage.findOne(query);
      res.send(result);
    });

    app.delete("/bookingDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await RoomBooking.deleteOne(query);
      res.send(result);
    });

    // Featured Room
    app.get("/featuredroom", async (req, res) => {
      const result = await FeaturedRoom.find().toArray();
      res.send(result);
    });

    //Hotel view Pic Start
    app.get("/hotelviewpic", async (req, res) => {
      const result = await hotelViewPicCollection.find().toArray();
      res.send(result);
    });

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
