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


app.listen(PORT, startServer)


// ipconfig /all