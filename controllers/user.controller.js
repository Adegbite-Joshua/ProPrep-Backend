const { default: mongoose } = require("mongoose")
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const { userModel, attemptedQuestionsModel } = require("../models/user.model");
const { Resend } = require('resend');
const { sign, verify } = require('jsonwebtoken');


const getRandomQuestions = (array, count) => {
  const shuffledArray = array.slice(); // Create a copy of the array to shuffle

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray.slice(0, count); // Return the first "count" elements
}

const resend = new Resend(process.env.RESEND_API_KEY);
const jwtSecret = process.env.JWTSECRET;


cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDKEY,
  api_secret: process.env.CLOUDSECRET
});

const createAccount = async (req, res) => {
  let { image_url, new_image_url, ...rest } = req.body;
  // let uploaded_url = image_url;
  userModel({ ...rest }).save()
    .then(async (response) => {
      res.status(201).json({ message: 'successful' });
      // if (new_image_url) {
      //     const uploadImage = await cloudinary.uploader.upload(req.body.image_url, {public_id: `proprep_${Math.round(Math.random()*10000)}${req.body.email}`});
      //     uploaded_url = uploadImage.secure_url;
      // }
      // response = {...response, image_url: uploaded_url};
      // userModel(response).save()
      // attem({
      //     _id: response._id,
      //     questions: []
      // }).save();
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
        from: process.env.USER_EMAIL,
        to: [req.body.email],
        subject: 'Welcome To ProPrep!',
        html: `<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">

            <div style="width: 600px; margin: auto; overflow: hidden; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin-top: 50px;">
          
              <h1 style="color: #6F42C1;">Welcome to ProPrep!</h1>
          
              <p style="font-size: 16px; line-height: 1.6em; color: #666;">
                Dear ${rest.fullName},
              </p>
          
              <p style="font-size: 16px; line-height: 1.6em; color: #666;">
                Thank you for creating an account on ProPrep – your ultimate destination for CBT quiz preparation. We are excited to have you on board!
              </p>
          
              <p style="font-size: 16px; line-height: 1.6em; color: #666;">
                At ProPrep, we provide a comprehensive collection of CBT quiz questions tailored for 100 level exams. Our goal is to help you improve your performance by offering quizzes designed to enhance your understanding of key concepts.
              </p>
          
              <p style="font-size: 16px; line-height: 1.6em; color: #666;">
                To get started and boost your preparation:
              </p>
          
              <ul style="font-size: 16px; line-height: 1.6em; color: #666; padding-left: 20px;">
                <li>Explore our 100 level quiz questions to target specific topics.</li>
                <li>Take quizzes regularly to reinforce your knowledge.</li>
                <li>Track your performance and monitor your progress over time.</li>
              </ul>
          
              <p style="font-size: 16px; line-height: 1.6em; color: #666;">
                We believe that effective preparation is the key to success, and our platform is designed to support your journey toward achieving your academic goals.
              </p>          
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
                <p style="font-size: 16px; line-height: 1.6em;">If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:support@proprep.com" style="color: #6F42C1;">support@proprep.com</a>.</p>
                <p style="font-size: 16px; line-height: 1.6em;">Best regards,<br/>The ProPrep Team</p>
              </div>
          
            </div>
          
          </body>`
      }
      transporter.sendMail(mailOptions)
        .then((response) => {
          console.log(response)
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((error) => {
      if (error.code = 11000) {
        res.status(409).json({ message: 'Email exists' })
      } else {
        res.status(500).json({ message: 'Server Error' })
      }
    })

}

const createAccount2 = async (req, res) => {
  let { image_url, new_image_url, email, ...rest } = req.body;
  // let uploaded_url = image_url;
  userModel({ ...rest, isEmailVerified: false, email: `${Math.round(Math.random()*1000)}${email}` }).save()
    .then(async (response) => {
      console.log(process.env.RESEND_API_KEY);
      res.status(201).json({ message: 'successful' });
      const tokenExpiration = '1h';
      const token = sign({email}, jwtSecret, {expiresIn: tokenExpiration});
      const { data, error } = await resend.emails.send({
        from: 'ProPrep <no-reply@cacagbalaiwosan.com.ng>',
        to: [email],
        subject: 'Welcome To ProPrep!',
        // react: OTPEmail({ firstName: findMember.firstName, otp }),
        html: `<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">

        <div style="width: 600px; margin: auto; overflow: hidden; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin-top: 50px;">
      
          <h1 style="color: #6F42C1;">Welcome to ProPrep!</h1>
      
          <p style="font-size: 16px; line-height: 1.6em; color: #666;">
            Dear ${rest.fullName},
          </p>
      
          <p style="font-size: 16px; line-height: 1.6em; color: #666;">
            Thank you for creating an account on ProPrep – your ultimate destination for CBT quiz preparation. We are excited to have you on board!
          </p>
      
          <p style="font-size: 16px; line-height: 1.6em; color: #666;">
            At ProPrep, we provide a comprehensive collection of CBT quiz questions tailored for 100 level exams. Our goal is to help you improve your performance by offering quizzes designed to enhance your understanding of key concepts.
          </p>
      
          <p style="font-size: 16px; line-height: 1.6em; color: #666;">
            To get started and boost your preparation:
          </p>
      
          <ul style="font-size: 16px; line-height: 1.6em; color: #666; padding-left: 20px;">
            <li>Explore our 100 level quiz questions to target specific topics.</li>
            <li>Take quizzes regularly to reinforce your knowledge.</li>
            <li>Track your performance and monitor your progress over time.</li>
          </ul>
      
          <p style="font-size: 16px; line-height: 1.6em; color: #666;">
            We believe that effective preparation is the key to success, and our platform is designed to support your journey toward achieving your academic goals.
          </p>          
      
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
            <p style="font-size: 16px; line-height: 1.6em;">To verify your email address and activate your account, please click <a href="https://proprepweb.vercel.app/user/verify_email_address/${token}" style="color: #6F42C1;">here</a>. Please note that the link will expire in the next hour.</p>
            <a href="https://proprepweb.vercel.app/user/verify_email_address/${token}" style="display: inline-block; background-color: #6F42C1; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Click here to verify email</a>
            <p style="font-size: 16px; line-height: 1.6em;">If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:support@proprep.com" style="color: #6F42C1;">support@proprep.com</a>.</p>
            <p style="font-size: 16px; line-height: 1.6em;">Best regards,<br/>The ProPrep Team</p>
          </div>
      
        </div>
      
      </body>
      `
      //   html: `<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">

      //   <div style="width: 600px; margin: auto; overflow: hidden; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin-top: 50px;">
      
      //     <h1 style="color: #6F42C1;">Welcome to ProPrep!</h1>
      
      //     <p style="font-size: 16px; line-height: 1.6em; color: #666;">
      //       Dear ${rest.fullName},
      //     </p>
      
      //     <p style="font-size: 16px; line-height: 1.6em; color: #666;">
      //       Thank you for creating an account on ProPrep – your ultimate destination for CBT quiz preparation. We are excited to have you on board!
      //     </p>
      
      //     <p style="font-size: 16px; line-height: 1.6em; color: #666;">
      //       At ProPrep, we provide a comprehensive collection of CBT quiz questions tailored for 100 level exams. Our goal is to help you improve your performance by offering quizzes designed to enhance your understanding of key concepts.
      //     </p>
      
      //     <p style="font-size: 16px; line-height: 1.6em; color: #666;">
      //       To get started and boost your preparation:
      //     </p>
      
      //     <ul style="font-size: 16px; line-height: 1.6em; color: #666; padding-left: 20px;">
      //       <li>Explore our 100 level quiz questions to target specific topics.</li>
      //       <li>Take quizzes regularly to reinforce your knowledge.</li>
      //       <li>Track your performance and monitor your progress over time.</li>
      //     </ul>
      
      //     <p style="font-size: 16px; line-height: 1.6em; color: #666;">
      //       We believe that effective preparation is the key to success, and our platform is designed to support your journey toward achieving your academic goals.
      //     </p>          
      
      //     <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
      //       <p style="font-size: 16px; line-height: 1.6em;">To verify your email address and activate your account, please click <a href="https://proprepweb.vercel.app/user/verify_email/${token}" style="color: #6F42C1;">here</a>. Please note that the link will expire in the next hour.</p>
      //       <p style="font-size: 16px; line-height: 1.6em;">If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:support@proprep.com" style="color: #6F42C1;">support@proprep.com</a>.</p>
      //       <p style="font-size: 16px; line-height: 1.6em;">Best regards,<br/>The ProPrep Team</p>
      //       <a href="#" style="display: inline-block; background-color: #6F42C1; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Click here to verify email</a>
      //       </div>
      
      //   </div>
      
      // </body>
      // `
      });
      console.log('data \n',data);
      console.log('error \n', error)

      if (error) {
        console.log(error)
        return;
      }
    })
    .catch((error) => {
      if (error.code = 11000) {
        res.status(409).json({ message: 'Email exists' })
      } else {
        res.status(500).json({ message: 'Server Error' })
      }
      console.log(error);
    })

}

const signIn = (req, res) => {
  let { password, email } = req.body;
  console.log(req.headers);
  userModel.findOne({ email })
    .then((response) => {
      if (response) {
        response.validatePassword(password, (error, same) => {
          if (same) {
            // let token = jwt.sign({password, email}, process.env.JWTSECRET);
            res.status(200).json({ message: 'successful', details: response });
          } else {
            res.status(400).json('incorrect password');
          }
        })
      } else {
        res.status(404).json('wrong email');
      }
    })
    .catch((error) => {
      console.log(error);
    })
}

const signIn2 = (req, res) => {
  let { password, email } = req.body;
  userModel.findOne({ email })
    .then((response) => {
      if (response) {
        if (!response.isEmailVerified) {
          res.status(403).json({ message: 'Email address is not verified'});          
          return;
        }
        response.validatePassword(password, (error, same) => {
          if (same) {
            // let token = jwt.sign({password, email}, process.env.JWTSECRET);
            res.status(200).json({ message: 'successful', details: response });
          } else {
            res.status(400).json('incorrect password');
          }
        })
      } else {
        res.status(404).json('wrong email');
      }
    })
    .catch((error) => {
      console.log(error);
    })
}

const sendVerificationEmail = (req, res) => {
  let { email } = req.body;
  // let uploaded_url = image_url;
  userModel.findOne({ email })
    .then(async (response) => {
      if(!response){
        res.status(404).json({ message: 'Invalid email address' });
        return
      }
      res.status(200).json({ message: 'successful' });
      const tokenExpiration = '1h';
      const token = sign({email}, jwtSecret, {expiresIn: tokenExpiration});
      console.log('response');
      const { data, error } = await resend.emails.send({
        from: 'ProPrep <no-reply@cacagbalaiwosan.com.ng>',
        to: [email],
        subject: 'Welcome To ProPrep!',
        // react: OTPEmail({ firstName: findMember.firstName, otp }),
        html: `<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">

        <div style="width: 600px; margin: auto; overflow: hidden; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin-top: 50px;">
      
          <h1 style="color: #6F42C1;">Welcome to ProPrep!</h1>
      
          <p style="font-size: 16px; line-height: 1.6em; color: #666;">
            Dear ${response.fullName},
          </p>
      
          <p style="font-size: 16px; line-height: 1.6em; color: #666;">
            To verify your email address and activate your account, please click the button below. Please note that the link will expire in the next hour.
          </p>
      
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://proprepweb.vercel.app/user/verify_email_address/${token}" style="display: inline-block; background-color: #6F42C1; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Verify Email</a>
          </div>
      
        </div>
      
      </body>`
      });
      console.log('data \n',data);
      console.log('error \n', error)

      if (error) {
        console.log(error)
        return;
      }
    })
    .catch((error) => {
      console.log(error);
    })
}

const verifyEmailAddress = async(req, res) => {
  let { token } = req.body;
  console.log(token);
  const result = await new Promise((resolve, reject) => {
    verify(token, jwtSecret, (error, result) => {
      if (error) {
        reject(error);
        res.status(404).json({message: "Invalid token"})
      } else {
        resolve(result);
      }
    });

    if (result.email) {
      userModel.findOneAndUpdate({ email: result.email}, {isEmailVerified: true})
        .then(()=>{
          res.status(200).json({message: 'Successful'})
        }).catch(()=>{
          res.status(404).json({message: "Invalid token"})
        })
    } else {
      res.status(404).json({message: "Invalid token"})
    }
  });


}

const sendNewPasswordEmail = async (req, res) => {
  let { email } = req.body;
  let validUser = await userModel.findOne({ email })
  if (!validUser) return res.status(404).json('Invalid email')
  let token = Math.floor(Math.random() * 1000000)
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
    html: `<p>Hello,   </p>
              <p>We received a request to reset your password. To proceed, please click on the link below:</p>
              <p>${token}The link will expire in 5 minutes, so please act quickly. If you did not request this password reset, you can ignore this email.</p>
              <p>Thank you,</p>
              <p>Your School's Support Team</p>
              <p style='text-align:center;'><small>Hope Academy. We are glad to have you!</small></p>`
  }
  transporter.sendMail(mailOptions)
    .then((response) => {
      res.status(200).json({ token });
    })
    .catch((err) => {
      console.log(err);
    });
}

const changePassword = (req, res) => {
  let { password, email } = req.body
  bcrypt.hash(password, Number(process.env.PASSWORD_SALTING))
    .then((hashedPassword) => {
      userModel.findOneAndUpdate({ email }, { password: hashedPassword })
        .then(() => {
          res.status(200).json('successful')
        })
        .catch((error) => {
          console.log(error);
        })
    })
    .catch((err) => {
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

      let sortedQuestions = [];
      return res.status(200).json(sortedQuestions);
    }

    if (!result.questions || result.questions.length === 0) {
      let sortedQuestions = [];
      return res.status(200).json(sortedQuestions);
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

const getLandingNews = (req, res) => {
  // res.status(200).json(`
  // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //   <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
  //     <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Welcome to ProPrep!</Text>
  //     <Text style={{ marginBottom: 16 }}>Thank you for choosing our app for your preparation. We are excited to help you achieve excellence in your endeavors.</Text>

  //     <TouchableOpacity onPress={closeModal}>
  //       <Text style={{ color: 'blue', fontWeight: 'bold', marginTop: 8 }}>Get Started</Text>
  //     </TouchableOpacity>
  //   </View>
  // </View>
  // `
  // )
  res.status(200).json({
    title: 'Welcome to ProPrep!',
    message: 'Thank you for choosing our app for your preparation. We are excited to help you achieve excellence in your endeavors.',
    // links: [{
    //   title: 'Example Link',
    //   link: 'www.example.com'
    // }]
  })

};

module.exports = { createAccount, createAccount2, signIn, signIn2, sendVerificationEmail, verifyEmailAddress, fetchCourseAttemptedQuestions, addAttemptedQuestion, getLandingNews, updateUserDetails, sendNewPasswordEmail, changePassword };