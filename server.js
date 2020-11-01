const express = require("express");
const app = express();
const port = 4000;
const router = express.Router();
const mongoose = require("mongoose");
const uri = "mongodb://localhost:27017/asksamdb";
const cookieParser = require('cookie-parser');
const cors = require('cors');
let sessionCount = 0;
let cookieData;
let questionIDForClient;
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
app.use(cookieParser())
// app.use(cors({
//   origin: [
//     'http://localhost:8080',
//     'https://localhost:8080',
//     'http://localhost:8081',
//     'https://localhost:8081',
//   ],
//   credentials: true,
//   exposedHeaders: ['set-cookie']
// }));



app.get("/", function(req, res) {
  console.log("GET: \"/\"")
  console.log('Cookies from Homepage: ', req.cookies)
  if(req.cookies.questionID === undefined) {
    res.cookie('questionID', ["homepage5", "homepage2"]).send('Cookie set, GET: Request received to homepage') //Sets questionID = questionCount
  } else {
    console.log("Homepage: Cookie already exists")
    res.send("Homepage: Cookie already exists")
  }
  
  // res.send("GET: Request received to homepage")
})

app.get('/needanswers', function(req, res) {
  Question.find({answered: false}).sort([['questionID', 1]]).exec(function(err, sortedList) {
    if(err) {
      console.log(err);
    } else {
      res.send(sortedList) 
    }
    });
})


app.post('/answered', function(req, res) {
  console.log("Question: ", req.query)
  console.log("Answer: ", req.query.answer);
  Question.find({questionID: req.query.questionID}, function(err, response) {
    if(err) {
      console.log("error finding in db");
      console.log(err)
    } else {
      console.log("found!")
      console.log(response)
    }
  })

  Question.update({questionID: req.query.questionID}, {answer: req.query.answer, answered: true}, function(err, response) {
    if(err) {
      console.log("Error updating");
      console.log(err);
    } else {
      console.log("Updated!");
      console.log(response);
    }
  })
  // console.log(req);
})

app.post("/submitquestion", function(req, res) {
  console.log("POST received from: ", req.url)
  Question.estimatedDocumentCount()
  .then(function(questionCount) {
    // console.log("Document count is: ", questionCount)  
    questionIDForClient = questionCount;
    console.log("Updated questionIDForClient: ", questionIDForClient);
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
  res.send("Post Received")

  console.log(req.query.question)
    sessionCount++;
});

app.get("/submitquestion", function(req, res) {
  console.log("GET from SubmitQuestion: Req.cookies ", req.cookies)
  cookieData = req.cookies;
  console.log("Cookie value ", req.cookies.questionID)
  if(cookieData.questionID === undefined) {
    console.log("SubmitQuestion: Cookie doesn't exist")
    res.cookie(`questionID${questionIDForClient}`, "Submit question cookie").send('Cookie set, GET: Request received to SubmitQuestion') //Sets questionID = questionCount
  } else {
    if(cookieData.questionID === questionIDForClient) {
      console.log("Same cookie, no need to add another")
      

    } else {
      console.log("Cookie value differs, creating new cookie now.")
      res.cookie(`questionID${questionIDForClient}`, {}).send('Cookie set, GET: Request received to SubmitQuestion') //Sets questionID = questionCount
    }
    console.log("SQ: Cookie already exists")
    console.log("SQ: questionIDForClient: ", questionIDForClient)
    res.cookie('questionID', `${questionIDForClient}`).send('Cookie set, GET: Request received to SubmitQuestion') //Sets questionID = questionCount
  }
})


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