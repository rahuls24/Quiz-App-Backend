import { Quiz } from './../models/quiz';
import { Question } from './../models/question';
import { NextFunction, Response } from 'express';
import { createAnError } from '../utils/errorHandler';
import { isValidMongoObjectId, isValidQuestionData } from '../utils/validators';
import { RequestForProtectedRoute } from './../interfaces/common';

export async function saveQuestionsForTheQuiz(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction,
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
				400,
			);
		const questionsList = await Question.insertMany(questionsData);
		if (!questionsList)
			throw createAnError(
				'Something went wrong while saving the questions into db. Please try again',
			);
		res.status(201).json({
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
	next: NextFunction,
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
		});
		// Hiding questions if user is not enrolled to current quiz
		if (user.role === 'examinee') {
			if (!quizData || quizData?.length === 0)
				throw createAnError('Quiz is not found in db', 404);
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
			},
		);

		if (!questionsList)
			throw createAnError(
				'Something went wrong while fetching questions from DB',
			);
		// Hiding the answer if user is not owner of the quiz
		if (quizData?.createdBy?.toString() !== user._id?.toString()) {
			questionsList = questionsList?.map(question => {
				return { ...question?._doc, answers: [] };
			});
		}
		if (shouldOnlyGiveTotalNoOfQuestion)
			return res.status(200).json({
				status: 'success',
				totalQuestions: questionsList?.length,
			});
		return res.status(200).json({
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
