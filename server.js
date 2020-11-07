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
  let _count = 0;
  console.log("/answered: req cookies", req.cookies)
  // console.log("Type: ", req.cookies[`questionID${_count}`])
  const _cookies = req.cookies;
  // const _nonParsedCookie1 = req.cookies.questionID3;
  // const _parsedCookies = cookieParser.JSONCookies(_cookies)
  // const _parsedCookie1 = cookieParser.JSONCookie(_cookies.questionID3)
  // console.log("ParsedCookies", _parsedCookies)
  // console.log("ParsedCookie[1]", _parsedCookies[1])
  // console.log("Parsed Cookie 1", _parsedCookie1)
  // console.log("_NonParsedCookie1", cookieParser.JSONCookie(_nonParsedCookie1))
  console.log("GET FROM ANSWERED: Count: ", `questionID${_count}`)
  console.log("GET FROM ANSWERED: Count Contents: ", _cookies[`questionID${_count}`])
  console.log("GET FROM ANSWERED: _cookies length", _cookies.length)
  while(_cookies[`questionID${_count}`] !== undefined || _cookies[`questionID${_count+1}`] !== undefined) {
    console.log("GET FROM ANSWERED: Each Cookie", _cookies[`questionID${_count}`])
    _count++;
  }
  res.send(_cookies)
  // for(let i = 0; i < 10; i++) {
  //   console.log("hello")
  //   console.log("Cookie from Cookies"+_cookies[i]);
  // }
  // _cookies.map((cookie, i) => {
  //   // Question.find({questionID: req.query.questionID}, function(err, response) {
  //   //   if(err) {
  //   //     console.log("error finding in db");
  //   //     console.log(err)
  //   //   } else {
  //   //     console.log("found!")
  //   //     console.log(response)
  //   //   }
  //   // })
  //   console.log(`Cookie${i}, ${cookie}`)
  // })
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
})

app.post("/submitquestion", function(req, res) {
  console.log("############################################################")
  console.log("#________________________POST FROM /SUBMITQUESTION_________#")
  console.log("############################################################")
  console.log("POST received from: ", req.url)
  Question.estimatedDocumentCount()
  .then(function(questionCount) {
    // console.log("Document count is: ", questionCount)  
    questionIDForClient = questionCount;
    console.log("POST FROM SQ: Updated questionIDForClient: ", questionIDForClient);
    Question.create({
      sessionID: sessionCount,
      questionID: questionCount,
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
  // console.log("GET FROM SQ: CookieData", cookieData)
  // console.log("GET FROM SQ: Cookie value ", req.cookies.questionID+questionIDForClient)
  if(cookieData.questionID === undefined) {
    console.group("GET FROM SQ: questionID === undefined");
    console.log("GET FROM SQ: SubmitQuestion: Cookie doesn't exist");
    console.groupEnd();
    res.cookie(`questionID${questionIDForClient}`, "Submit question cookie", { maxAge: 9000000000 }) //Sets questionID = questionCount
  } else {
    console.log("GET FROM SQ: questionID !== undefined")
    if(cookieData.questionID === questionIDForClient) {
      console.log("GET FROM SQ: Same cookie, no need to add another")
    } else {
      console.group("Cookie differs, creating now...")
      console.log("GET FROM SQ: Cookie value differs, creating new cookie now.")
      console.groupEnd();
      res.cookie(`questionID${questionIDForClient}`, `${questionIDForClient}`, { maxAge: 9000000000 }) //Sets questionID = questionCount
    }
    // console.log("GET FROM SQ: Cookie already exists")
    // console.log("GET FROM SQ: questionIDForClient: ", questionIDForClient)
    // res.cookie('questionID', `${questionIDForClient}` + 4) //Sets questionID = questionCount
  }
  res.send('Cookie set, GET: Request received to SubmitQuestion')
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