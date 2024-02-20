const { default: mongoose } = require("mongoose")
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const { userModel, attemptedQuestionsModel } = require("../models/user.model");


const getRandomQuestions = (array, count)=> {
    const shuffledArray = array.slice(); // Create a copy of the array to shuffle
  
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); 
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
  
    return shuffledArray.slice(0, count); // Return the first "count" elements
}
  



cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDKEY,
    api_secret: process.env.CLOUDSECRET
});

const createAccount = async(req,res)=>{
    let {image_url, new_image_url, ...rest} = req.body;
    // let uploaded_url = image_url;
    userModel({...rest}).save()
    .then(async(response)=>{
        res.status(201).json('saved')
        // if (new_image_url) {
        //     const uploadImage = await cloudinary.uploader.upload(req.body.image_url, {public_id: `proprep_${Math.round(Math.random()*10000)}${req.body.email}`});
        //     uploaded_url = uploadImage.secure_url;
        // }
        // response = {...response, image_url: uploaded_url};
        // userModel(response).save()
        attemptedQuestionsModel({
            _id: response._id,
            questions: []
        }).save();
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASSWORD
            },
            tls: {
                rejectUnauthorized: false,
            },
    
        })
        let mailOptions = {
            from: process.env.USEREMAIL,
            to: [req.body.email],
            subject: 'hello',
            html: `hello`
        }
        transporter.sendMail(mailOptions)
        .then((response)=>{
            console.log(response)
        })
        .catch((err) => {
            console.log(err);
        });
    })
    .catch((error)=>{
        if(error.code = 11000){
            res.status(409).json({message: 'Email exists'})
        } else {
            res.status(500).json({message: 'Server Error'})
        }
    })
        
}

const signIn =(req,res)=>{
    let {password,  email} = req.body;
    userModel.findOne({email:req.body.email})
    .then((response)=>{
       if(response){
            response.validatePassword(password, (error, same)=>{
                if (same) {
                    // let token = jwt.sign({password, email}, process.env.JWTSECRET);
                    res.status(200).json({message:'successful', details: response});
                } else{
                    res.status(400).json('incorrect password');
                }
            })            
       } else{
            res.status(404).json('wrong email');
       }
    })
    .catch((error)=>{
        console.log(error);
    })
}

const getAttemptedQuestions = (req, res) => {

}

module.exports = {createAccount, signIn};