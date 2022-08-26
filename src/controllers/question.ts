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
		// Req Body validations
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
			status: 'success'
		});
	} catch (error) {
		next(error);
		//--------------Implementation part is done ---------------------

		//! Swagger docs
		/*
		#swagger.tags = ['Question'];
		#swagger.description = 'Endpoint to save a question in the db';
		#swagger.security = [
			{
				apiKeyAuth: []
			}
		];

		#swagger.parameters['obj'] = {
			in: 'body',
			description: 'Question Data',
			required: true,
			schema: {
				$questionText: 'Question Title',
				$questionType: { $ref: '#/definitions/QuestionType' },
				$quizzes: ['629ca5720cf3c0efda1644b2'],
				$options: ['option 1', 'option 2'],
				$answers: ['0','1'],
			}
		};

		#swagger.responses[201] = {
			description: 'Questions are saved successfully.',
			schema: {
				$status: 'success'
			}
		};
		#swagger.responses[400] = {
			description: 'When there is something wrong with request body.',
			schema: {
				$status: 'fail',
				$error:
					'Payload is not in required format. Please check and try again'
			}
		};
		#swagger.responses[500] = {
			description: 'When there is something with server',
			schema: {
				$status: 'fail',
				$error:
					'Something went wrong while saving the questions into db. Please try again'
			}
		}; 
		 */
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
		// validation of params
		if (!isValidMongoObjectId(quizId))
			throw createAnError('Please give a valid quiz id', 400);

		let quizData = await Quiz.findById(quizId, {
			_id: 0,
			enrolledBy: 1,
			createdBy: 1,
			marks: 1
		}).lean();
		if (!quizData)
			throw createAnError(
				'Quiz is not found in db',
				httpStatusCode.notFound
			);
		if (isUserAlreadyGivenQuiz(quizData.marks, user._id))
			throw createAnError(
				'User already given this quiz',
				httpStatusCode.forbidden
			);
		// Hiding questions if user is not enrolled to current quiz
		if (user.role === 'examinee') {
			if (!quizData.enrolledBy.map(String).includes(String(user._id)))
				shouldOnlyGiveTotalNoOfQuestion = true;
		}
		let questionsList = await Question.find(
			{
				quizzes: { $in: [quizId] }
			},
			{
				_id: 1,
				questionText: 1,
				questionType: 1,
				options: 1,
				answers: 1,
				images: 1
			}
		).lean();
		console.log(
			shouldOnlyGiveTotalNoOfQuestion,
			quizData.enrolledBy.map(String).includes(user._id)
		);
		if (!questionsList)
			throw createAnError(
				'Something went wrong while fetching questions from DB'
			);
		// Hiding the answer if user is not owner of the quiz
		if (quizData.createdBy.toString() !== user._id.toString()) {
			questionsList = questionsList?.map((question) => {
				return { ...question, answers: [] };
			});
		}
		if (shouldOnlyGiveTotalNoOfQuestion)
			return res.status(httpStatusCode.ok).json({
				status: 'success',
				totalQuestions: questionsList.length
			});
		return res.status(httpStatusCode.ok).json({
			status: 'success',
			questions: questionsList
		});
	} catch (error) {
		next(error);
		//--------------Implementation part is done ---------------------

		//! Swagger docs
		/*
		#swagger.tags = ['Question'];
		#swagger.description = 'Endpoint to getting all the questions of a quiz';
		#swagger.security = [
			{
				apiKeyAuth: []
			}
		];

		#swagger.parameters['quizId'] = {
			in: 'query',
			description:
				'Quiz ID for which you want to retrieve all its questions',
			required: true,
			type: 'string'
		};

		#swagger.responses[200] = {
			description: 'Questions are saved successfully. 
			There will be 3 type of responses on basis of role and owner of the quiz.',
			schema: {
				$status: 'success',
				questions: {
					$ref: '#/definitions/Question'
				}
			}
		};
		#swagger.responses[400] = {
			description: 'When quiz id is a valid quiz id',
			schema: {
				$status: 'fail',
				$error: 'Please give a valid quiz id'
			}
		};
		#swagger.responses[404] = {
			description: 'When quiz id is not found in db',
			schema: {
				$status: 'fail',
				$error: 'Quiz is not found in db'
			}
		};
		#swagger.responses[500] = {
			description: 'When there is something with server',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while fetching questions from DB'
			}
		};
		*/
	}
}

// It is required only for testing

// function delayForGivenTime(time: number) {
// 	return new Promise((res, rej) => {
// 		setTimeout(() => {
// 			res(24);
// 		}, time);
// 	});
// }
