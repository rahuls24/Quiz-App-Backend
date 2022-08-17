import { NextFunction, Response } from 'express';
import { createAnError } from '../utils/errorHandler';
import { isUserAlreadyGivenQuiz } from '../utils/quizFunctions';
import { isValidMongoObjectId, isValidQuestionData } from '../utils/validators';
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
        let quizData:any= await Quiz.findById(quizId, {
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
            if (!quizData.enrolledBy.includes(user._id))
                shouldOnlyGiveTotalNoOfQuestion = true;
        }
        let questionsList:any = await Question.find(
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
            questionsList = questionsList?.map((question:any) => {
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

// NEED TO DELATE
function delayForGivenTime(time: number) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(24);
        }, time);
    });
}
