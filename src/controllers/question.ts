import { NextFunction, Response } from 'express';
import { QuizTimeTracker } from '../models/quizTimeTracker';
import { createAnError } from '../utils/errorHandler';
import {
    calculateMarks,
    calculateNumberOfRightWrongAnswersAndSkippedQuestion,
    differenceFromNowInMinutes,
    isUserAlreadyGivenQuiz,
    normalizeQuestionData,
} from '../utils/quizFunctions';
import {
    isValidMongoObjectId,
    isValidQuestionData,
    isValidSubmittedQuestions,
} from '../utils/validators';
import { RequestForProtectedRoute } from './../interfaces/common';
import { Question } from './../models/question';
import { Quiz } from './../models/quiz';
import { httpStatusCode } from './../utils/responseHandler';

export async function saveQuestionsForTheQuiz(
    req: RequestForProtectedRoute,
    res: Response,
    next: NextFunction
) {
    let questionsData = req.body.questionsData;
    try {
        if (
            !(
                Array.isArray(questionsData) &&
                questionsData.every(isValidQuestionData)
            )
        )
            throw createAnError(
                'Payload is not in required format. Please check and try again',
                httpStatusCode.badRequest
            );
        const questionsList = await Question.insertMany(questionsData);
        if (!questionsList)
            throw createAnError(
                'Something went wrong while saving the questions into db. Please try again'
            );
        res.status(httpStatusCode.created).json({
            status: 'success',
            questions: questionsList,
        });
    } catch (error) {
        next(error);
    }
}

export async function getAllQuestionsOfAQuiz(
    req: RequestForProtectedRoute,
    res: Response,
    next: NextFunction
) {
    const quizId = req.params.quizId;
    const user = req.user;
    let shouldOnlyGiveTotalNoOfQuestion = false;
    try {
        if (!isValidMongoObjectId(quizId))
            throw createAnError('Please give a valid quiz id', 400);
        const quizData = await Quiz.findById(quizId, {
            _id: 0,
            enrolledBy: 1,
            createdBy: 1,
            marks: 1,
        });
        if (!quizData)
            throw createAnError(
                'Quiz is not found in db',
                httpStatusCode.notFound
            );
        if (isUserAlreadyGivenQuiz(quizData?.marks, user._id))
            throw createAnError(
                'User already given this quiz',
                httpStatusCode.forbidden
            );
        // Hiding questions if user is not enrolled to current quiz
        if (user.role === 'examinee') {
            if (!quizData?.enrolledBy?.includes(user._id))
                shouldOnlyGiveTotalNoOfQuestion = true;
        }
        let questionsList = await Question.find(
            {
                quizzes: { $in: [quizId] },
            },
            {
                _id: 1,
                questionText: 1,
                questionType: 1,
                options: 1,
                answers: 1,
                images: 1,
            }
        );

        if (!questionsList)
            throw createAnError(
                'Something went wrong while fetching questions from DB'
            );
        // Hiding the answer if user is not owner of the quiz
        if (quizData?.createdBy?.toString() !== user._id?.toString()) {
            questionsList = questionsList?.map((question) => {
                return { ...question?._doc, answers: [] };
            });
        }
        if (shouldOnlyGiveTotalNoOfQuestion)
            return res.status(httpStatusCode.ok).json({
                status: 'success',
                totalQuestions: questionsList?.length,
            });
        return res.status(httpStatusCode.ok).json({
            status: 'success',
            questions: questionsList,
        });
    } catch (error) {
        next(error);
    }
}

export async function submitQuizHandler(
    req: RequestForProtectedRoute,
    res: Response,
    next: NextFunction
) {
    const quizId = req.body.quizId ?? '';
    const submittedQuestions = req.body.submittedQuestions;
    const user = req.user;
    try {
        if (!isValidMongoObjectId(quizId))
            throw createAnError('Please give a valid quiz id', 400);
        if (!isValidSubmittedQuestions(submittedQuestions))
            throw createAnError(
                'Something wrong with submittedQuestions obj',
                400
            );
        let getQuestionList = Question.find(
            {
                quizzes: { $in: [quizId] },
            },
            {
                _id: 1,
                answers: 1,
            }
        );
        let getQuizTimeDetails = QuizTimeTracker.findOne({
            quizId: quizId,
            startedBy: user._id,
        });

        let questionsList = await getQuestionList;
        let quizTimeDetails = await getQuizTimeDetails;
        if (questionsList?.length === 0)
            throw createAnError(
                'Something went wrong while fetching questions from DB'
            );
        if (!quizTimeDetails)
            throw createAnError(
                'Something went wrong while getting quiz start time'
            );
        let totalTimeTaken = differenceFromNowInMinutes(
            quizTimeDetails?.startedAt
        );
        const normalizeQuestionsDataFromDB =
            normalizeQuestionData(questionsList);
        const normalizeQuestionsDataFromReqObj =
            normalizeQuestionData(submittedQuestions);
        const [
            numberOfRightAnswers,
            numberOfWrongAnswers,
            numberSkippedQuestions,
        ] = calculateNumberOfRightWrongAnswersAndSkippedQuestion(
            normalizeQuestionsDataFromDB,
            normalizeQuestionsDataFromReqObj
        );
        // Default marks will be 1 per correct answer
        const totalMarks = calculateMarks(
            numberOfRightAnswers,
            numberOfWrongAnswers,
            1
        );
        const marksPayload = {
            marks: totalMarks,
            examineeId: user._id,
            numberOfRightAnswers,
            numberOfWrongAnswers,
            totalTimeTaken,
        };
        const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, {
            $push: { marks: marksPayload },
        });
        if (!updatedQuiz)
            throw createAnError(
                'Something went wrong while saving the marks into db. Please try again'
            );

        res.status(httpStatusCode.ok).json({
            status: 'success',
            result: {
                marks: totalMarks,
                numberOfRightAnswers: numberOfRightAnswers,
                numberOfWrongAnswers: numberOfWrongAnswers,
                numberSkippedQuestions: numberSkippedQuestions,
                totalTimeTaken: totalTimeTaken,
            },
        });
    } catch (error) {
        next(error);
    }
}
// NEED TO DELATE
function delayForGivenTime(time: number) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(24);
        }, time);
    });
}
