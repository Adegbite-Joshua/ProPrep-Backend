const { default: mongoose } = require("mongoose");
const { questionsModel } = require("../models/question.model");
const { userModel } = require("../models/user.model");


const getRandomQuestions = (array, count) => {
  const shuffledArray = array.slice();

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray.slice(0, count); // Return the first "count" elements
}

const uploadQuestions = async (req, res) => {
  try {
    let { level, department, semester, courseCode, question } = req.body;

    const updatedDocument = await questionsModel.findOneAndUpdate(
      { level },
      {
        $push: {
          [`${department}.${semester}.questions.${courseCode}`]: question,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Questions uploaded successfully:', updatedDocument);
    res.status(200).json(updatedDocument);
  } catch (error) {
    console.error('Error uploading questions:', error);
    res.status(500).send('Internal Server Error');
  }
};

const generateRandomQuestions = async (req, res) => {
  let { level, department, semester, courseCode, numberOfQuestions } = req.body;
  try {
    const document = await questionsModel.findOne({ level }, { [`${department}.${semester}.questions.${courseCode}`]: 1 });

    const allQuestions = document[department][semester].questions.get(courseCode);
    console.log(allQuestions);

    if (!allQuestions || allQuestions.length === 0) {
      throw new Error('No questions found for the specified courseCode.');
    }

    const maxQuestions = Math.min(numberOfQuestions, allQuestions.length);
    console.log(allQuestions.length)
    console.log(maxQuestions)

    const copyOfQuestions = [...allQuestions];

    for (let i = copyOfQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copyOfQuestions[i], copyOfQuestions[j]] = [copyOfQuestions[j], copyOfQuestions[i]];
    }

    const randomQuestions = copyOfQuestions.slice(0, maxQuestions);

    res.status(200).json({ questions: randomQuestions, startingTime: Date.now() });
  } catch (error) {
    console.error('Error generating random questions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// const generateRandomOfflineQuestions = async (req, res) => {
//   const { level, department, semester, numberOfQuestions } = req.body;

//   try {
//     const document = await questionsModel.findOne({ level }, {
//       [`${department}.${semester}.questions`]: 1,
//       [`general.${semester}.questions`]: 1,
//     });

//     const allQuestions = [
//       ...(document?.[department]?.[semester]?.questions?.values() || []),
//       ...(document?.general?.[semester]?.questions?.values() || []),
//     ].flat();

//     if (!allQuestions || allQuestions.length === 0) {
//       throw new Error('No questions found for the specified criteria.');
//     }

//     const maxQuestions = Math.min(numberOfQuestions, allQuestions.length);

//     const copyOfQuestions = [...allQuestions];

//     for (let i = copyOfQuestions.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [copyOfQuestions[i], copyOfQuestions[j]] = [copyOfQuestions[j], copyOfQuestions[i]];
//     }

//     const randomQuestions = copyOfQuestions.slice(0, maxQuestions);

//     res.status(200).json({ questions: randomQuestions});
//   } catch (error) {
//     console.error('Error generating random questions:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// const generateRandomOfflineQuestions = async (req, res) => {
//   const { level, department, semester } = req.body;
//   const numberOfQuestions = 100;
//   try {
//     const document = await questionsModel.findOne({ level }, {
//       [`${department}.${semester}.questions`]: 1,
//       [`general.${semester}.questions`]: 1,
//     });

//     const allQuestions = [
//       ...(Object.values(document?.[department]?.[semester]?.questions || {}) || []),
//       ...(Object.values(document?.general?.[semester]?.questions || {}) || []),
//     ].flat();

//     if (!allQuestions || allQuestions.length === 0) {
//       throw new Error('No questions found for the specified criteria.');
//     }

//     const maxQuestions = Math.min(numberOfQuestions, allQuestions.length);

//     const copyOfQuestions = [...allQuestions];
   
//     for (let i = copyOfQuestions.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [copyOfQuestions[i], copyOfQuestions[j]] = [copyOfQuestions[j], copyOfQuestions[i]];
//     }

//     const randomQuestions = copyOfQuestions.slice(0, maxQuestions);
//     res.status(200).json(randomQuestions[0]);
//   } catch (error) {
//     console.error('Error generating random questions:', error);
//     res.status(500).json({ error });
//   }
// };

const generateRandomOfflineQuestions = async (req, res) => {
  const { level, department, semester } = req.body;
  const numberOfQuestions = 100;
  try {
    const document = await questionsModel.findOne({ level }, {
      [`${department}.${semester}.questions`]: 1,
      [`general.${semester}.questions`]: 1,
    });

    const allQuestions = [
      ...(Object.values(document?.[department]?.[semester]?.questions || {}) || []),
      ...(Object.values(document?.general?.[semester]?.questions || {}) || []),
    ].flat();

    if (!allQuestions || allQuestions.length === 0) {
      throw new Error('No questions found for the specified criteria.');
    }

    const maxQuestions = Math.min(numberOfQuestions, allQuestions.length);

    const copyOfQuestions = [...allQuestions];
   
    for (let i = copyOfQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copyOfQuestions[i], copyOfQuestions[j]] = [copyOfQuestions[j], copyOfQuestions[i]];
    }

    const randomQuestions = copyOfQuestions.slice(0, maxQuestions);
    res.status(200).json(randomQuestions);
  } catch (error) {
    console.error('Error generating random questions:', error);
    res.status(500).json({ error });
  }
};


module.exports = { uploadQuestions, generateRandomQuestions, generateRandomOfflineQuestions };