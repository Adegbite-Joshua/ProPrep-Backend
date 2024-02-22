const express = require('express')
const { createAccount, signIn, fetchAttemptedQuestions } = require('../controllers/user.controller')
const router = express.Router()

router.post('/create_account', createAccount)
router.post('/sign_in', signIn)
router.post('/get_attempted_questions', fetchAttemptedQuestions)


module.exports = router