const express = require('express')
const { createAccount, signIn, fetchCourseAttemptedQuestions, addAttemptedQuestion, getLandingNews, updateUserDetails, sendNewPasswordEmail, changePassword, verifyEmailAddress, sendVerificationEmail } = require('../controllers/user.controller')
const router = express.Router()

router.post('/create_account', createAccount)
router.post('/sign_in', signIn)
router.post('/send_verification_email', sendVerificationEmail)
router.post('/verify_email_address', verifyEmailAddress)
router.post('/send_forgot_password_token', sendNewPasswordEmail)
router.post('/reset_password', changePassword)
router.post('/update_details', updateUserDetails)
router.post('/get_attempted_questions', fetchCourseAttemptedQuestions)
router.post('/save_attempted_questions', addAttemptedQuestion)
router.get('/get_latest_update', getLandingNews)


module.exports = router;