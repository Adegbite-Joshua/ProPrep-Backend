const express = require('express');
const { uploadQuestions, generateRandomQuestions } = require('../controllers/question.controller');
const router = express.Router();

router.post('/upload_questions', uploadQuestions)
router.post('/get_questions', generateRandomQuestions)


module.exports = router