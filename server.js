const express = require("express");
const app = express();
const port = 4000;
const router = express.Router();
const mongoose = require("mongoose");
const questions = require("./model");
const uri = "mongodb://localhost:27017/asksamdb";
let sessionCount = 0;

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

const questionSchema = new mongoose.Schema({
  sessionID: Number,
  questionID: Number,
  question: String,
  answered: Boolean,
  answer: String
})

const Question = mongoose.model('Question', questionSchema);


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
  sessionCount++;
})

router.route("/submitquestion").post(function(req, res) {
  console.log("POST received from: ", req.url)
  res.send("Post Received")
  Question.count({}, function(response) {
    console.log("Document count: ", response)
    // console.log(response)
  })
  const question = new Question({
    sessionID: sessionCount,
    questionID: 0,
    question: req.query.question,
    answered: false,
    answer: ''
  })
  question.save()
  .then(function(response) {
    console.log("saved")
    console.log(response);
  })
  .catch(function(err) {
    console.log("error");
    console.log(err);
  })
  // Question.create({
  //   sessionID: sessionCount,
  //   questionID: 0,
  //   question: req.query.question,
  //   answered: false,
  //   answer: ''
  // }, function(response) {
  //   console.log("success!");
  //   console.log(response);
  // })

  console.log(req.query.question)
    // questions.insertOne(data, function(err, result) {
    //     if (err) {
    //       console.log(err)
    //     } else {
    //       console.log(result);
    //     }
    //   });
});

app.delete('/cleardatabase', function(req, res) {
  console.log("Delete request received")
  Question.deleteMany({
    //parameters
  }, function() {
    console.log('Deleted all in database')
    console.log("Database contents")
    Question.find({}, function(response) {
      console.log("Database contents: ")
      console.log(response)
    })
  })
}) 

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