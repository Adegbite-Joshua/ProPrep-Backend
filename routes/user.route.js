const express = require('express')
const { createAccount, signIn } = require('../controllers/user.controller')
const router = express.Router()

router.post('/create_account', createAccount)
router.post('/sign_in', signIn)


module.exports = router