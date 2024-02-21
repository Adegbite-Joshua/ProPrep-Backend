const express = require('express');
const { uploadQuestions, generateRandomQuestions, generateRandomOfflineQuestions } = require('../controllers/question.controller');
const router = express.Router();

router.post('/upload_questions', uploadQuestions)
router.post('/get_questions', generateRandomQuestions)
router.post('/get_offline_questions', generateRandomOfflineQuestions)


module.exports = router