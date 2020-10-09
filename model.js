const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let questionSchema = new Schema(
  {
    sessionID: {
      type: Number
    },
    questionID: {
      type: Number
    },
    question: {
      type: String
    },
    answered: {
      type: Boolean
    },
    answer: {
      type: String
    }

  },
  { collection: "Questions" }
);

module.exports = mongoose.model("questions", questionSchema);