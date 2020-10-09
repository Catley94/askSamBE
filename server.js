const express = require("express");
const app = express();
const port = 4000;
const router = express.Router();
const mongoose = require("mongoose");
const questions = require("./model");
const uri = "mongodb://localhost:27017/asksamdb";

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

// const data = [
//     {
//       name: "John",
//       age: 21,
//       location: "New York"
//     },
//     {
//       name: "Smith",
//       age: 27,
//       location: "Texas"
//     },
//     {
//       name: "Lisa",
//       age: 23,
//       location: "Chicago"
//     }
//   ];

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});

app.use("/", router);

router.route("/").get(function(req, res) {
  console.log("GET: \"/\"")
})

router.route("/submitquestion").post(function(req, res) {
  console.log("POST received from: ", req.url)
  res.send("Post Received")
  let data = [
    {
      sessionID: 0,
      questionID: 0,
      question: req.query.question,
      answered: false,
      answer: ''

    }
  ]
  console.log(req.query.question)
    // questions.insertOne(data, function(err, result) {
    //     if (err) {
    //       console.log(err)
    //     } else {
    //       console.log(result);
    //     }
    //   });
});

// router.route("/fetchdata").get(function(req, res) {
//     employees.find({}, function(err, result) {
//       if (err) {
//         res.send(err);
//       } else {
//         res.send(result);
//       }
//     });
//   });

app.listen(port, function() {
  console.log("Server is running on Port: " + port);
});