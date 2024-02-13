const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const cors = require('cors')
const { startServer } = require('./controllers/server.controller')
app.use(express.urlencoded({ extended: true, limit: '200mb' }))
app.use(express.json({limit: '200mb'}))
const studentRoute = require('./routes/student.route')
const socket  = require('socket.io')
const http = require('http')

// app.use(cors({ origin: ['http://localhost:2000'] }));

const PORT = process.env.PORT1 || process.env.PORT2
const URI = process.env.URI

mongoose.connect(URI)
.then((res)=>{
    console.log('connected');
})
.catch((err)=>{
    console.log(err);
})

app.use('/student', studentRoute)


app.listen(PORT, startServer)


// ipconfig /all