<template>
    <div id="askSamContainer">
        <h1>{{ header }}</h1>
        <h2 v-if="currentQuestion !== ''">{{ currentQuestion.question }}</h2>
        <h2 v-else>There are no questions available</h2>
        <form @submit.prevent="handleSubmit">
            <input :disabled="questionsList == ''" v-model="answer" name="answer" type="text" placeholder="Type answer here">
            <button>Submit</button>
        </form>
        
    </div>
</template>

<script>
//Import
const axios = require('axios');
// const instance = axios.create({
//   baseURL: 'http://localhost:4000',
//   timeout: 1000,
//   headers: {'Access-Control-Allow-Origin': '*',}
// });
const options = {
    headers: {'Access-Control-Allow-Origin': '*'}
}
axios.defaults.baseURL = 'http://localhost:4000';
// axios.defaults.headers = {'Access-Control-Allow-Origin': '*'}
export default {
    created() {
        console.log("created")
        console.log("Gathering Question List")
        this.getQuestions();
    },
    name: 'ask-sam-container',
  data() {
      return {
          header: "Ask Sam - Answers",
          questionsList: "",
          currentQuestion: "",
          answer: "",
      }
      
  },
  methods: {
      getQuestions() {
          axios.get("/needanswers")
          .then((response) => {
              console.log("Success, got questions")
              console.log(response.data)
              if(response.data.length > 0) {
                  console.log("Response.data available")
                  this.questionsList = response;
                  this.currentQuestion = response.data[0];
              } else {
                  console.log("Response.data is not available")
                  this.questionsList = "No questions available";
                  
              }
              
          })
          .catch((err) => {
              this.questionsList = "No questions available";
              console.log("Error getting questions");
              console.log(err);
          })
          console.log("Question: ", this.question)
      },
      handleSubmit() {
        axios.post(`/answered?answer=${this.answer}&questionID=${this.currentQuestion.questionID}`, {
            question: this.currentQuestion,
            answer: this.answer
        }, options)
        .then(function (response) {
            // handle success
            console.log("success!")
            console.log(response);
        })
        .catch(function (error) {
            // handle error
            console.log("error occured")
            console.log(error);
        })
          console.log("Submit pressed")
          this.answer = '';
      },
  }
}


</script>

<style scoped>

</style>
