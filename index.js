const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const cors = require('cors')
const { startServer } = require('./controllers/server.controller')
app.use(express.urlencoded({ extended: true, limit: '200mb' }))
app.use(express.json({limit: '200mb'}))
const userRoute = require('./routes/user.route');
const questionRoute = require('./routes/question.route');
const { bio101 } = require('./questions/first_semester/bio101')
const { chm101 } = require('./questions/first_semester/chm101')
const { faa101 } = require('./questions/first_semester/faa101')
const { gns101 } = require('./questions/first_semester/gns101')
const { lib101 } = require('./questions/first_semester/lib101')
const { mth101 } = require('./questions/first_semester/mth101')


// app.use(cors({ origin: '*' }));

const PORT = process.env.PORT1 || process.env.PORT2
const URI = process.env.URI

mongoose.connect(URI)
.then((res)=>{
    console.log('connected');
})
.catch((err)=>{
    console.log(err);
})

app.use(`/api/${process.env.HIDDEN_ROUTE}/user`, userRoute);
app.use(`/api/${process.env.HIDDEN_ROUTE}/question`, questionRoute);

const validateQuestions = (questions) => {
    const validationResults = [];
  
    questions.forEach((question, index) => {
      if (question.type === 'options') {
        const { question: q, options, correctAnswer, solution } = question;
  
        if (!q.trim()) {
          validationResults.push(`Question ${index + 1} is empty.`);
          console.log("\n")
        console.log(q)
        }
  
        if (options.length <= 2) {
          validationResults.push(`Question ${index + 1}: Options should have more than 2 elements.`);
          console.log("\n")
        console.log(q)
        }
  
        if (!correctAnswer.trim()) {
          validationResults.push(`Question ${index + 1}: Correct answer is missing.`);
          console.log("\n")
        console.log(q)
        }
  
        if (!solution.trim()) {
          validationResults.push(`Question ${index + 1}: Solution is missing.`);
          console.log("\n")
        console.log(q)
        }
      } else if (question.type === 'structural') {
        const { question: q, correctAnswer, solution } = question;
  
        if (!q.trim()) {
          validationResults.push(`Question ${index + 1} is empty.`);
          console.log("\n")
        console.log(q)
        }
  
        if (!correctAnswer.trim()) {
          validationResults.push(`Question ${index + 1}: Correct answer is missing.`);
          console.log("\n")
        console.log(q)
        }
  
        if (!solution.trim()) {
          validationResults.push(`Question ${index + 1}: Solution is missing.`);
          console.log("\n")
        console.log(q)
        }
      }
    });
  
    return validationResults;
  };
  
  
//   const questions = [...bio101]; 
//   const questions = [...chm101]; 
//   const questions = [...faa101]; 
//   const questions = [...gns101]; 
//   const questions = [...lib101]; 
  const questions = [...mth101]; 
  
  const validationResults = validateQuestions(questions);
  
//   if (validationResults.length > 0) {
//     console.log('Validation failed with the following issues:');
//     validationResults.forEach((result) => console.log(result));
//   } else {
//     console.log('All questions passed validation.');
//   }
  

app.listen(PORT, startServer)


// ipconfig /all