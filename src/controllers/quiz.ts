import { NextFunction, Response } from 'express';
import { Schema } from 'mongoose';
import { RequestForProtectedRoute } from '../interfaces/common';
import { Question } from '../models/question';
import { createAnError, createFailureResponseObj } from '../utils/errorHandler';
import {
	calculateMarks,
	calculateNumberOfRightWrongAnswersAndSkippedQuestion,
	differenceFromNowInMinutes,
	getCurrentUserMarks,
	normalizeQuestionData
} from '../utils/quizFunctions';
import { responseHandler } from '../utils/responseHandler';
import {
	isValidMongoObjectId,
	isValidReqBodyComingFromGetAllQuizzesForExaminers,
	isValidReqBodyComingFromSaveQuiz,
	isValidSubmittedQuestions
} from '../utils/validators';
import { Quiz } from './../models/quiz';
import { QuizTimeTracker } from './../models/quizTimeTracker';
import { httpStatusCode } from './../utils/responseHandler';
let swagger: any = {};
export async function saveQuiz(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	const newQuiz = {
		name: String(req.body.name ?? ''),
		topics: String(req.body.topics ?? 'misc').split(','),
		createdBy: String(user._id ?? ''),
		enrolledBy: [user._id],
		quizDuration: String(req.body.totalTime)
	};
	try {
		const [isReqBodyContainsValidData, errorMsg] =
			isValidReqBodyComingFromSaveQuiz(newQuiz);
		if (!isReqBodyContainsValidData)
			throw createAnError(errorMsg, httpStatusCode.badRequest);
		const quiz = await new Quiz(newQuiz).save();
		if (!quiz)
			throw createAnError('Something went wrong while saving the quiz');
		return res.status(201).json({
			status: 'success'
		});
	} catch (error) {
		next(error);
		//--------------Implementation part is done ---------------------

		//! Swagger docs
		/* 
		#swagger.tags = ['Quiz'];

		#swagger.description = 'Endpoint to save a quiz';

		#swagger.parameters['obj'] = {
			in: 'body',
			description: 'Quiz information.',
			required: true,
			schema: {
				$name: 'A Dummy Quiz Name',
				$topics: 'dsa,coding,nodejs,js',
				$quizDuration: '30',
			},
		};

		#swagger.responses[201] = {
			description: 'When quiz is saved successfully',
			schema: {
				$status: 'success',
			},
		};

		#swagger.responses[400] = {
			description: 'When there is something wrong with request body.',
			schema: {
				$status: 'fail',
				$error: {
					$ref: '#/definitions/BadRequestForSaveQuiz',
				},
			},
		};
		#swagger.responses[500] = {
			description: 'When there is something with server',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while saving the quiz',
			},
		};
		*/
	}
}

async function getAllQuizzesForCurrentExaminer(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	const currentExaminerId = user?._id;
	try {
		const quizzes = await Quiz.find(
			{ createdBy: currentExaminerId },
			{ enrolledBy: 0, __v: 0 }
		).lean();
		if (!quizzes)
			throw createAnError(
				'Something went wrong while getting quiz for the examiner'
			);
		return res.status(httpStatusCode.ok).json({
			status: 'success',
			quizzes: quizzes
		});
	} catch (error) {
		next(error);
	}
}

async function getAllQuizForCurrentExaminee(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	const currentExamineeId = user._id;
	try {
		const quizzes = await Quiz.find({
			$and: [
				{ enrolledBy: { $in: [currentExamineeId] } },
				{ 'marks.examineeId': { $ne: currentExamineeId } }
			]
		}).lean();
		if (!quizzes)
			throw createAnError(
				'Something went wrong while getting quiz for the examinee'
			);
		let resObj = {
			status: 'success',
			quizzes: quizzes
		};
		return responseHandler(res, httpStatusCode.ok, resObj);
	} catch (error) {
		next(error);
	}
}
export async function getAllQuizzesForCurrentUser(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	if (user.role.toLowerCase() === 'examiner') {
		return getAllQuizzesForCurrentExaminer(req, res, next);
	} else if (user.role.toLowerCase() === 'examinee') {
		return getAllQuizForCurrentExaminee(req, res, next);
	} else {
		let resObj = createFailureResponseObj('Something wrong in user role');
		return responseHandler(res, httpStatusCode.conflict, resObj);
	}
	//--------------Implementation part is done ---------------------

	//! Swagger docs
	/*
		#swagger.tags = ['Quiz'];
		#swagger.description = 'Endpoint to get all quiz of the current user';
		#swagger.responses[200] = {
			description: 'When quizzes are retrieved successfully',
			schema: {
				$status: 'success',
				quizzes: {
					$ref: '#/definitions/Quiz',
				},
			},
		};
		#swagger.responses[500] = {
			description: 'When there is something with server',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while getting quiz for the user',
			},
		};
		
		*/
}
export async function getAllQuizzesForExaminers(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const examiners = req.body.examiners;

	try {
		const [isReqBodyContainsValidData, errorMsg] =
			isValidReqBodyComingFromGetAllQuizzesForExaminers(examiners);
		if (!isReqBodyContainsValidData)
			throw createAnError(errorMsg, httpStatusCode.badRequest);

		const quizzes = await Quiz.find({
			createdBy: { $in: examiners }
		}).lean();

		if (!quizzes)
			throw createAnError(
				'Something went wrong while getting quizzes'
			);
		let resObj = {
			status: 'success',
			quizzes: quizzes
		};
		return responseHandler(res, httpStatusCode.ok, resObj);
	} catch (error) {
		next(error);
		//--------------Implementation part is done ---------------------

		//! Swagger docs
        /*
		#swagger.tags = ['Quiz'];
		#swagger.description = 'Endpoint to get all quizzes of list of examiner';
		#swagger.parameters['obj'] = {
			in: 'body',
			description: 'List of examiner ids',
			required: true,
			schema: {
				$examiners: ['629ca58c0cf3c0efda1644b5','629ca3d78b22bd7a8ad4e47e']
			}
		};

		#swagger.responses[200] = {
			description: 'When quizzes are retrieved successfully',
			schema: {
				$status: 'success',
				quizzes: [{
					$ref: '#/definitions/Quiz'
				}]
			}
		};
		#swagger.responses[500] = {
			description: 'When there is something with server',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while getting quizzes'
			}
		};
		*/
	}
}

export async function enrollAExamineeInAQuiz(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	const userId = user._id;
	let quizId = String(req.body.quizId??'');
	
	try {
		if (!isValidMongoObjectId(quizId)) throw createAnError('Please send a valid quiz id',httpStatusCode.badRequest)
		// TODO: Add logic to handle paid quizzes.
		const updatedQuiz = await Quiz.updateOne(
			{ _id: quizId },
			{ $addToSet: { enrolledBy: new Schema.Types.ObjectId(userId) } }
		);

		if (updatedQuiz.modifiedCount === 0)throw createAnError('User is already enrolled in this quiz or quiz may not found',httpStatusCode.forbidden) 
		res.status(httpStatusCode.noContent).json({
			status: 'success'
		})
	} catch (error) {
		next(error);
		//--------------Implementation part is done ---------------------

		//! Swagger docs
        /*
		#swagger.tags = ['Quiz'];
		#swagger.description = 'Endpoint to enroll in a quiz';
		#swagger.parameters['obj'] = {
			in: 'body',
			description: 'Quiz Id in which examinee want to enroll',
			required: true,
			schema: {
				$quizId: '629ca3d78b22bd7a8ad4e47e'
			}
		};

		#swagger.responses[204] = {
			description: 'When quizzes are retrieved successfully',
			schema: {
				$status: 'success',
			}
		};
		#swagger.responses[400] = {
			description: 'When the quiz id is not a valid id',
			schema: {
				$status: 'fail',
				$error: 'Please send a valid quiz id'
			}
		};
		#swagger.responses[403] = {
			description: 'When user is already enrolled in the quiz',
			schema: {
				$status: 'fail',
				$error: 'User is already enrolled in this quiz or quiz may not found'
			}
		};
		*/
	}
}

export async function getAllUnEnrolledQuizForCurrentUser(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	if (user.role.toLowerCase() === 'examiner') {
		try {
			const examinerQuiz = await Quiz.find({
				createdBy: { $ne: user._id }
			});
			if (!examinerQuiz)
				throw createAnError(
					'Something went wrong while fetching quiz for examiner'
				);
			let resObj = {
				status: 'success',
				quizzes: examinerQuiz
			};
			return responseHandler(res, httpStatusCode.ok, resObj);
		} catch (error) {
			next(error);
		}
	} else if (user.role.toLowerCase() === 'examinee') {
		try {
			const quizzes = await Quiz.find({
				enrolledBy: { $nin: [user._id] }
			});
			if (!quizzes)
				throw createAnError(
					'Something went wrong while getting quiz for the examinee'
				);
			let resObj = {
				status: 'success',
				quizzes: quizzes
			};
			return responseHandler(res, httpStatusCode.ok, resObj);
		} catch (error) {
			next(error);
		}
	} else {
		let resObj = createFailureResponseObj('Something wrong in user role');
		return responseHandler(res, httpStatusCode.conflict, resObj);
	}
}

export async function saveQuizStartTime(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	const payload = {
		quizId: req.body.quizId,
		startedBy: user._id
	};
	try {
		if (!isValidMongoObjectId(payload.quizId))
			throw createAnError('Please send a valid quiz id', 400);
		const getQuizDetails = Quiz.findById(payload.quizId);
		const getTimeForCurrentQuiz = QuizTimeTracker.findOne({
			quizId: req.body.quizId,
			startedBy: user._id
		});
		const isQuizPresent = await getQuizDetails;
		const isTimeForCurrentQuizIsPresent = await getTimeForCurrentQuiz;
		console.log(isTimeForCurrentQuizIsPresent);
		if (!isQuizPresent)
			throw createAnError('Quiz is not present in DB', 404);
		if (isTimeForCurrentQuizIsPresent)
			throw createAnError(
				'Time is already present',
				httpStatusCode.conflict
			);
		const isSaved = await new QuizTimeTracker(payload).save();
		if (!isSaved)
			throw createAnError('Something went wrong while saving time in db');
		return res.status(httpStatusCode.noContent).json({
			status: 'success'
		});
	} catch (error) {
		next(error);
	}
}

export async function getQuizStartTime(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const quizId = req.params.quizId;
	const user = req.user;
	try {
		if (!isValidMongoObjectId(quizId))
			throw createAnError('Please send a valid quiz id', 400);
		const startTime = await QuizTimeTracker.find({
			$and: [{ quizId: quizId, startedBy: user._id }]
		});
		if (startTime.length === 0)
			throw createAnError('Start time is not present in db', 404);
		if (startTime.length > 1)
			throw createAnError(
				'There is more than one time for this Quiz',
				404
			);
		return res.status(httpStatusCode.ok).json({
			status: 'success',
			startTime: startTime[0]
		});
	} catch (error) {
		next(error);
	}
}

export async function getQuizzesHistory(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	// throw new Error('Rahul is throwing some error');
	const currentUser = req.user;
	try {
		const rawQuizzesDetails = await Quiz.find(
			{
				$and: [
					{ enrolledBy: currentUser._id },
					{ 'marks.examineeId': currentUser._id }
				]
			},
			{ _id: 1, marks: 1, name: 1, quizDuration: 1 }
		);
		const quizzesDetails = rawQuizzesDetails.map((quiz) => {
			return {
				quizId: quiz._id,
				quizName: quiz.name,
				quizDuration: quiz.quizDuration,
				quizResult: getCurrentUserMarks(
					quiz.marks,
					currentUser._id.toString()
				)
			};
		});

		return res.status(httpStatusCode.ok).json({
			status: 'success',
			quizzesDetails: quizzesDetails
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
				quizzes: { $in: [quizId] }
			},
			{
				_id: 1,
				answers: 1
			}
		).lean();
		let getQuizTimeDetails = QuizTimeTracker.findOne({
			quizId: quizId,
			startedBy: user._id
		}).lean();

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
			quizTimeDetails.startedAt
		);
		const normalizeQuestionsDataFromDB = normalizeQuestionData(
			questionsList.map((question) => ({
				_id: question._id.toString(),
				answers: question.answers
			}))
		);
		const normalizeQuestionsDataFromReqObj =
			normalizeQuestionData(submittedQuestions);
		const [
			numberOfRightAnswers,
			numberOfWrongAnswers,
			numberSkippedQuestions
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
			numberSkippedQuestions: numberSkippedQuestions
		};
		const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, {
			$push: { marks: marksPayload }
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
				totalTimeTaken: totalTimeTaken
			}
		});
	} catch (error) {
		next(error);
	}
}

// Only need for testing
function delayForGivenTime(time: number) {
	return new Promise((res, rej) => {
		setTimeout(() => {
			res(24);
		}, time);
	});
}
