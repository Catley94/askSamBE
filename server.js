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
let questionIDForClient = 0;
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
  console.log("############################################################")
  console.log("#________________________GET FROM /________________________#")
  console.log("############################################################")
  console.log("GET: \"/\"")
  console.log('Cookies from Homepage: ', req.cookies)
  if(req.cookies.questionID === undefined) {
    res.cookie('questionID', "Homepage Cookie", { maxAge: 9000000000 }).send('Cookie set, GET: Request received to homepage') //Sets questionID = questionCount
    console.log("Created cookie")
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

app.get('/answered', function (req, res) {
  console.log("############################################################")
  console.log("#________________________GET FROM /ANSWERED________________#")
  console.log("############################################################")
  const cookieValues = Object.keys(req.cookies).filter(key => key.startsWith("questionID")).map(key => req.cookies[key])
  console.log("GET FROM ANSWERED: cookieValues: ", cookieValues)
  res.send(cookieValues)
  // cookieValues.map(cookie => console.log("cookieValue: ", cookie))
})

app.post('/answered', function(req, res) {
  console.log("############################################################")
  console.log("#________________________POST FROM /ANSWERED_______________#")
  console.log("############################################################")
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

  // res.redirect(`/submitquestion`);
})

app.post("/submitquestion", function(req, res) {
  console.log("############################################################")
  console.log("#________________________POST FROM /SUBMITQUESTION_________#")
  console.log("############################################################")
  console.log("POST received from: ", req.url)
  console.log("POST FROM SQ: Checking cookies: ", req.cookies)
  Question.estimatedDocumentCount()
  .then(function(questionCount) {
    console.log("POST FROM SQ: Document count is: ", questionCount)  
    questionIDForClient = questionCount;
    
    Question.create({
      sessionID: sessionCount,
      questionID: questionIDForClient,
      question: req.query.question,
      answered: false,
      answer: ''
    }, function(err, response) {
      console.log("POST FROM SQ: Created and saved");
      console.log("POST FROM SQ: ", response)
    })
  })
  res.send("Post Received")


  console.log("POST FROM SQ: ", req.query.question)
    sessionCount++;
});

app.get("/submitquestion", function(req, res) {
  console.log("############################################################")
  console.log("#________________________GET FROM /SUBMITQUESTION__________#")
  console.log("############################################################")
  console.log("GET FROM SQ: Req.cookies ", req.cookies)
  cookieData = req.cookies;
  console.log("GET FROM SQ: CookieData: ", cookieData)
  Question.estimatedDocumentCount()
  .then(function(questionCount) {
    questionIDForClient = questionCount;
    console.log("GET FROM SQ: 1. Updated questionIDForClient: ", questionIDForClient);
    res.cookie(`questionID${questionIDForClient}`, `${questionIDForClient}`, { maxAge: 9000000000 }).send('Cookie set, GET: Request received to SubmitQuestion') //Sets questionID = questionCount
  })
  // console.log("GET FROM SQ: CookieData", cookieData)
  // console.log("GET FROM SQ: Cookie value ", req.cookies.questionID+questionIDForClient)
  if(cookieData.questionID === undefined) {
    // console.group("GET FROM SQ: questionID === undefined");
    // console.log("GET FROM SQ: SubmitQuestion: Cookie doesn't exist");
    console.groupEnd();
    res.cookie(`2. questionID${questionIDForClient}`, "Submit question cookie", { maxAge: 9000000000 }) //Sets questionID = questionCount
  } else {
    // console.log("GET FROM SQ: questionID !== undefined")
    console.log("GET FROM SQ: questionID Value: ", cookieData.questionID)
    if(cookieData.questionID === questionIDForClient) {
      console.log("3. GET FROM SQ: Same cookie, no need to add another")
    } else {
      console.group("4. Cookie differs, creating now...")
      console.log("GET FROM SQ: Cookie value differs, creating new cookie now.")
      console.log("GET FROM SQ: Question ID for Client: ", questionIDForClient)
      console.log("Checking cookies: ", req.cookies)
      console.groupEnd();
      res.cookie(`questionID${questionIDForClient}`, `${questionIDForClient}`, { maxAge: 9000000000 }) //Sets questionID = questionCount
      
      if(req.cookies[`questionID${questionIDForClient}`] === undefined) {
        console.log("5. GET FROM SQ: Cookie may have been created, however is not showing, adding again...")
        res.cookie(`questionID${questionIDForClient}`, `${questionIDForClient}`, { maxAge: 9000000000 }) //Sets questionID = questionCount
      } else {
        console.log("6. GET FROM SQ: Cookie does exist, no need to add again")
      }
      
    }
    // console.log("GET FROM SQ: Cookie already exists")
    // console.log("GET FROM SQ: questionIDForClient: ", questionIDForClient)
    // res.cookie('questionID', `${questionIDForClient}` + 4) //Sets questionID = questionCount
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