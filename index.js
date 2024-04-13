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
// const { bio101 } = require('./questions/first_semester/bio101')
// const { chm101 } = require('./questions/first_semester/chm101')
// const { faa101 } = require('./questions/first_semester/faa101')
// const { gns101 } = require('./questions/first_semester/gns101')
// const { lib101 } = require('./questions/first_semester/lib101')
// const { mth101 } = require('./questions/first_semester/mth101')
// const { phy101 } = require('./questions/first_semester/phy101')
// const { acc101 } = require('./questions/first_semester/acc101')
// const { acc108 } = require('./questions/first_semester/acc108')
// const { mgt102 } = require('./questions/first_semester/mgt102')
// const { mgt106 } = require('./questions/first_semester/mgt106')
// const { mgt110 } = require('./questions/first_semester/mgt110')
// const { mgt112 } = require('./questions/first_semester/mgt112')
// const { questionsModel } = require('./models/question.model')
// const { acc102 } = require('./questions/first_semester/acc102')
// const { eco104 } = require('./questions/first_semester/eco104')
// const { mkt102 } = require('./questions/first_semester/mkt102')


app.use(cors({ origin: '*' }));

const PORT = process.env.PORT1 || process.env.PORT2
const URI = process.env.URI

mongoose.connect(URI)
.then((res)=>{
    console.log('connected');
    // let questions = acc108;
    // try {
    //   let level = '100'
    //   //   let department = 'science'
    //   let department = 'commercial'
    //   // let department = 'general'
    //   let semester = 'firstSemester'
    //   let courseCode = 'acc108'
      
      
    //   // questions.map(async(question)=>{
    //   //   const updatedDocument = await questionsModel.findOneAndUpdate(
    //   //     { level },
    //   //     {
    //   //       $push: {
    //   //         [`${department}.${semester}.questions.${courseCode}`]: question,
    //   //       },
    //   //     },
    //   //     { upsert: true, new: true, setDefaultsOnInsert: true, projection: { _id: 1 } }
    //   //     );
          
    //   //     console.log(question.question);
    //   //     console.log('Question uploaded successfully:', updatedDocument);
    //   // })
    // } catch (error) {
    //   console.error('Error uploading questions:', error);
    // }
})
.catch((err)=>{
    console.log(err);
})

app.use(`/api/${process.env.HIDDEN_ROUTE}/user`, userRoute);
app.use(`/api/${process.env.HIDDEN_ROUTE}/question`, questionRoute);

app.post(`/api/${process.env.HIDDEN_ROUTE}/contact_us`, (req, res)=>{
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD
        }

    })
    let mailOptions = {
        from: process.env.USER_EMAIL,
        to: ['adegbitejoshua007@gmail.com'],
        subject: 'Message For ProPrep Admin',
        text: 'New Message',
        html: `<h1 style='text-align:center'>Messge From: ${req.body.name}</h1>
                <p style='text-align:center'>Email Address: ${req.body.email}</p>
                <p style='text-align:center'>Message: ${req.body.message}</p>
                <p style='text-align:center; background-color: purple;'><small>Kindly go through this email and get back to the messenger. ProPrep!❤️</small></p>`

    }

    transporter.sendMail(mailOptions)
        .then((response) => {
            console.log(response)
            res.status(200).json('success');
        })
        .catch((err) => {
            console.log(err);
            res.status(458).json('error');
        });
})

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
//   const questions = [...mth101]; 
//   const questions = [...phy101]; 
  
// const questions = [...acc102]; 
// const questions = [...eco104]; 
// const questions = [...mkt102]; 
  
//   const validationResults = validateQuestions(questions);
  
//   if (validationResults.length > 0) {
//     console.log('Validation failed with the following issues:');
//     validationResults.forEach((result) => console.log(result));
//   } else {
//     console.log('All questions passed validation.');
//   }

    

app.listen(PORT, startServer)


// ipconfig /all