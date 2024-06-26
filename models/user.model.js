const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    fullName: { required: true, type: String },
    email: { required: true, type: String, unique: true },
    phoneNumber: { required: true, type: String },
    isEmailVerified: {type: Boolean},
    password: { required: true, type: String },
    level: { required: true, type: String },
    department: { required: true, type: String },
    paidSubscription: { type: Boolean },
    testQuestionNumber: { type: Number },
    attemptedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'attemptedQuestions' }]
})

const attemptedQuestionsSchema = new mongoose.Schema({
    _id: { type: String },
    questions: [
        {
            courseCode: { type: String },
            questions: [
                {
                    type: { type: String },
                    question: { type: String },
                    options: { type: Array },
                    correctAnswer: { type: String },
                    solution: { type: String },
                    selectedAnswer: { type: String, required: false },
                    userAnswer: { type: String, required: false },
                },
            ],
            score: { type: Number },
            date: { type: String },
        }
    ]
})


userSchema.pre('validate', function (next) {
    bcrypt.hash(this.password, Number(process.env.PASSWORD_SALTING))
        .then((hashedPassword) => {
            this.password = hashedPassword
            console.log(this.password);
            next()
        })
        .catch((err) => {
            console.log(err);
        })
})

userSchema.methods.validatePassword = function (password, callback) {
    bcrypt.compare(password, this.password, (error, same) => {
        if (!error) {
            callback(error, same)
            console.log(same)
        } else {
            next()
        }
    })

}

const userModel = mongoose.model(`user_details`, userSchema);
const attemptedQuestionsModel = mongoose.model(`attemptedQuestions`, attemptedQuestionsSchema);


module.exports = { userModel, attemptedQuestionsModel };
