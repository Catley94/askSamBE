const express = require("express");
const app = express();
const port = 4000;
const router = express.Router();
const mongoose = require("mongoose");
const uri = "mongodb://localhost:27017/asksamdb";
let sessionCount = 0;
// let questionCount = 0;

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


app.get("/", function(req, res) {
  console.log("GET: \"/\"")
  res.send("GET: You have reached the home page")
})

router.route("/submitquestion").post(function(req, res) {
  console.log("POST received from: ", req.url)
  res.send("Post Received")
  // Question.countDocuments({}, function(response) {
  //   console.log("Document count: ", response)
  // })
  Question.estimatedDocumentCount()
  .then(function(questionCount) {
    console.log("Document count is: ", questionCount)
    Question.create({
      sessionID: sessionCount,
      questionID: questionCount,
      question: req.query.question,
      answered: false,
      answer: ''
    }, function(err, response) {
      console.log("Created and saved");
      console.log(response)
    })
  })

  console.log(req.query.question)
    sessionCount++;
});

app.delete('/cleardatabase', function(req, res) {
  console.log("Delete request received")
  Question.deleteMany({
    //parameters
  }, function(err, response) {
    if(err) {
      console.log("Error deleting all questions in database!")
    } else {
      console.log('Deleted all in database');
      console.log("Database contents");
    }
    Question.estimatedDocumentCount()
    .then(function(questionCount) {
      console.log("Question count: ", questionCount);
    })
    .catch(function(err) {
      console.log("Error!");
      console.log(err);
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