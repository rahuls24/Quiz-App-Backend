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
	try {
		if (!isValidMongoObjectId(quizId))
			throw createAnError('Please give a valid quiz id', 400);
		const questionsList = await Question.find({
			quizzes: { $in: [quizId] },
		});
		if (!questionsList)
			if (!isValidMongoObjectId(quizId))
				throw createAnError(
					'Something went wrong while fetching questions from DB',
				);
		res.status(200).json({
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
