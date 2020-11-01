<template>
    <div id="askSamContainer">
        <h1>{{ header }}</h1>
        <form @submit.prevent="handleSubmit">
            <input v-model="question" name="question" type="text" placeholder="Type question here">
            <button>Submit</button>
        </form>
        <form @submit.prevent="clearDatabase">
            <button>Clear Database</button>
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
axios.defaults.withCredentials = true;
// axios.defaults.headers = {'Access-Control-Allow-Origin': '*'}
export default {
    mounted() {
        console.log("mounted")
        axios.get('/')
        .then(() => {
            console.log("Requested \"/\"")
        })
        .catch(() => {
            console.log("error!")
        })
    },
    name: 'ask-sam-container',
  data() {
      return {
          header: "Ask Sam",
          question: ''

      }
      
  },
  methods: {
      handleSubmit() {
        axios.get("/submitquestion")
        .then(function() {
            console.log("Success, Sent cookie");

        })
        .catch(function() {
            console.log("Error, cookie not sent!");
        })
        axios.post(`/submitquestion?question=${this.question}`, {
            question: this.question
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
          this.question = '';
        axios.get("/submitquestion")
        .then(function() {
            console.log("Success, Sent cookie");
        })
        .catch(function() {
            console.log("Error, cookie not sent!");
        })
      },
      clearDatabase() {
          axios.delete('/cleardatabase'), {
              //
          }
          .then(function(response) {
              console.log(response);
          })
          .catch(function(err) {
              console.log("error!");
              console.log(err);
          })
      }
  }
}


</script>

<style scoped>

</style>
