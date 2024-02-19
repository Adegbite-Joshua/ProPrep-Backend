const mongoose = require('mongoose')


const questionSchema = new mongoose.Schema({
    type: { type: String },
    question: { type: String },
    options: { type: Array },
    correctAnswer: { type: String },
    solution: { type: String }
})

const questionsSchema = new mongoose.Schema({
    level: {type:String},  
    general: {
        firstSemester: {
            questions: {
                mth101: [
                    {
                        type: { type: String },
                        question: { type: String },
                        options: { type: Array },
                        correctAnswer: { type: String },
                        solution: { type: String }
                    },
                ],
            },            
        },
        secondSemester: {
            questions: {
                type: Map,
                of: [questionSchema]
              },
        }
    },
    science: {
        firstSemester: {
            questions: {
                type: Map,
                of: [questionSchema]
            },        
        },
        secondSemester: {
            questions: {
                type: Map,
                of: [questionSchema]
            },
        }
    }
})

const questionsModel = mongoose.model(`questions`, questionsSchema);


module.exports = { questionsModel };
