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
        res.status(201).json('saved');
        // if (new_image_url) {
        //     const uploadImage = await cloudinary.uploader.upload(req.body.image_url, {public_id: `proprep_${Math.round(Math.random()*10000)}${req.body.email}`});
        //     uploaded_url = uploadImage.secure_url;
        // }
        // response = {...response, image_url: uploaded_url};
        // userModel(response).save()
        attem({
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

const sendNewPasswordEmail = async(req,res)=>{
  let {email} = req.body;
  let validUser = await userModel.findOne({email})
  if (!validUser) return res.status(404).json('Invalid email')
  let token = Math.floor(Math.random()*1000000)
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.USER_PASSWORD
      },
      tls: {
          rejectUnauthorized: false, // This allows self-signed certificates
      },

  })
  let mailOptions = {
      from: process.env.USER_EMAIL,
      to: ['adegbitejoshua007@gmail.com', email],
      subject: 'Password Reset Link',
      html: `<p>Hello,</p>
              <p>We received a request to reset your password. To proceed, please click on the link below:</p>
              <p>${token}The link will expire in 5 minutes, so please act quickly. If you did not request this password reset, you can ignore this email.</p>
              <p>Thank you,</p>
              <p>Your School's Support Team</p>
              <p style='text-align:center;'><small>Hope Academy. We are glad to have you!</small></p>`
  }
  transporter.sendMail(mailOptions)
  .then((response)=>{
      res.status(200).json({token});
  })
  .catch((err) => {
      console.log(err);
  });
}

const changePassword =(req,res)=>{
  let {password, email} = req.body
  bcrypt.hash(password, Number(process.env.PASSWORD_SALTING))
  .then((hashedPassword)=>{
      userModel.findOneAndUpdate({email}, {password: hashedPassword})
      .then(()=>{
          res.status(200).json('successful')
      })
      .catch((error)=>{
          console.log(error);
      })
  })
  .catch((err)=>{
      console.log(err);
  })
}

const updateUserDetails = async (req, res) => {
  try {
    const { userId, ...newDetails } = req.body;
    
    const result = await userModel.findByIdAndUpdate(userId, { $set: newDetails }, { new: true });

    res.status(200).json({ message: 'User details updated successfully!', updatedUser: result });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const fetchAttemptedQuestions = async (req, res) => {
    try {
      const { startingNumber, endingNumber, userId } = req.params;
  
      const result = await attemptedQuestionsModel.findOne({
        'questions.courseCode': { $exists: true },
      },
      {
        _id: userId,
        questions: {
          $elemMatch: {
            $and: [
              { 'courseCode': { $exists: true } },
              { 'questions': { $exists: true, $ne: [] } },
            ],
          },
        },
      })
      .sort({ 'questions.date': -1 })
      .limit(endingNumber - startingNumber + 1);
  
      if (!result) {
        // Create a new document if not found
        const newDocument = new attemptedQuestionsModel();
        await newDocument.save();
  
        return res.status(200).json({ sortedQuestions: [] });
      }
  
      if (!result.questions || result.questions.length === 0) {
        return res.status(200).json({ sortedQuestions: [] });
      }
  
      const sortedQuestions = result.questions[0];
  
      res.status(200).json({ sortedQuestions });
    } catch (error) {
      console.error('Error fetching and sorting questions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

const fetchCourseAttemptedQuestions = async (req, res) => {
  try {
    const { startingNumber, endingNumber, userId } = req.body;

    const result = await attemptedQuestionsModel.findOne(
      { _id: userId },
      {
        _id: 0,
        questions: { $slice: [startingNumber, endingNumber - startingNumber] }
      }
    );

    if (!result) {
      // Create a new document if not found
      const newDocument = new attemptedQuestionsModel({ _id: userId });
      await newDocument.save();

      return res.status(200).json({ sortedQuestions: [] });
    }

    if (!result.questions || result.questions.length === 0) {
      return res.status(200).json({ sortedQuestions: [] });
    }

    const sortedQuestions = result.questions;

    res.status(200).json(sortedQuestions);
  } catch (error) {
    console.error('Error fetching and sorting questions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addAttemptedQuestion = async (req, res) => {
  try {
    const { userId, newQuestion } = req.body;
    
    const result = await attemptedQuestionsModel.updateOne(
      { _id: userId },
      { $push: { questions: newQuestion } },
      { upsert: true } 
    );

    if (result.nModified === 0 && result.upserted.length === 0) {   
      throw new Error('Failed to add question. User may not exist.');
    }

    res.status(200).json({ message: 'Question added successfully!' });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getLandingNews = (req, res) =>{
  res.status(200).json({
    title: 'Hello, This is a message',
    message: 'Hello buddy, this is a presaved message',
    links: [{
      title: 'lklkl',
      link: 'jjjjj'
    }]
  })
};

module.exports = {createAccount, signIn, fetchCourseAttemptedQuestions, addAttemptedQuestion, getLandingNews, updateUserDetails, sendNewPasswordEmail, changePassword};