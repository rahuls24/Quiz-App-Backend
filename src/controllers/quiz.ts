import { NextFunction, Response } from 'express';
import { Types } from 'mongoose';
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
			status: 'success',
			quiz
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
			{ __v: 0 }
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
			throw createAnError('Something went wrong while getting quizzes');
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
	let quizId = String(req.body.quizId ?? '');

	try {
		if (!isValidMongoObjectId(quizId))
			throw createAnError(
				'Please send a valid quiz id',
				httpStatusCode.badRequest
			);
		// TODO: Add logic to handle paid quizzes.
		const updatedQuiz = await Quiz.updateOne(
			{ _id: quizId },
			{ $addToSet: { enrolledBy: new Types.ObjectId(userId) } }
		);
		if (updatedQuiz.modifiedCount === 0)
			throw createAnError(
				'User is already enrolled in this quiz or quiz may not found',
				httpStatusCode.forbidden
			);
		res.status(httpStatusCode.noContent).json({
			status: 'success'
		});
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
	try {
		if (user.role.toLowerCase() === 'examiner') {
			const examinerQuizzes = await Quiz.find(
				{
					createdBy: { $ne: user._id }
				},
				{ __v: 0 }
			).lean();
			if (!examinerQuizzes)
				throw createAnError(
					'Something went wrong while fetching quiz for examiner'
				);
			return res.status(httpStatusCode.ok).json({
				status: 'success',
				quizzes: examinerQuizzes
			});
		} else if (user.role.toLowerCase() === 'examinee') {
			const examineeQuizzes = await Quiz.find(
				{
					enrolledBy: { $nin: [user._id] }
				},
				{ __v: 0 }
			).lean();
			if (!examineeQuizzes)
				throw createAnError(
					'Something went wrong while retrieving quizzes for the examinee'
				);
			return res.status(httpStatusCode.ok).json({
				status: 'success',
				quizzes: examineeQuizzes
			});
		} else {
			throw createAnError(
				'Something wrong in user role',
				httpStatusCode.conflict
			);
		}
	} catch (error) {
		next(error);
		//--------------Implementation part is done ---------------------

		//! Swagger docs
		/*
		#swagger.tags = ['Quiz'];
		#swagger.description = 'Endpoint to get all unenrolled quizzes';
		#swagger.responses[200] = {
			description: 'When quizzes are retrieved successfully',
			schema: {
				$status: 'success',
				quizzes: [{
					$ref: '#/definitions/Quiz'
				}]
			}
		};
		#swagger.responses[409] = {
			description: 'When role is matched with defined roles',
			schema: {
				$status: 'fail',
			}
		};
		#swagger.responses[500] = {
			description: 'When there is something with server',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while retrieving quizzes'
			}
		};
		*/
	}
}

export async function saveQuizStartTime(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	const payload = {
		quizId: String(req.body.quizId ?? ''),
		startedBy: user._id
	};
	try {
		if (!isValidMongoObjectId(payload.quizId))
			throw createAnError(
				'Please send a valid quiz id',
				httpStatusCode.badRequest
			);

		const getQuizDetails = Quiz.findById(payload.quizId).lean();
		const getTimeForCurrentQuiz = QuizTimeTracker.findOne({
			quizId: req.body.quizId,
			startedBy: user._id
		});

		const isQuizPresent = await getQuizDetails;
		const isTimeForCurrentQuizIsPresent = await getTimeForCurrentQuiz;

		if (!isQuizPresent)
			throw createAnError(
				'Quiz is not present in DB',
				httpStatusCode.notFound
			);
		if (isTimeForCurrentQuizIsPresent)
			throw createAnError(
				'Time is already present',
				httpStatusCode.conflict
			);

		const isSaved = await new QuizTimeTracker(payload).save();
		if (!isSaved)
			throw createAnError('Something went wrong while saving time in db');

		return res.status(httpStatusCode.created).json({
			status: 'success'
		});
	} catch (error) {
		next(error);
		//--------------Implementation part is done ---------------------

		//! Swagger docs
		/*
		#swagger.tags = ['Quiz'];
		#swagger.description = 'Endpoint to save quiz start time for a quiz';
		#swagger.parameters['obj'] = {
			in: 'body',
			description: 'Quiz id of quiz for which you want to save start time',
			required: true,
			schema: {
				$quizId: '629ca3d78b22bd7a8ad4e47e'
			}
		};

		#swagger.responses[201] = {
			description: 'When start time is saved successfully.',
			schema: {
				$status: 'success',
			}
		};
		#swagger.responses[400] = {
			description: 'When req body contains invalid quiz id.',
			schema: {
				$status: 'fail',
				$error: 'Please send a valid quiz id'
			}
		};
		#swagger.responses[404] = {
			description: 'When quiz is not found.',
			schema: {
				$status: 'fail',
				$error: 'Quiz is not present in DB'
			}
		};
		#swagger.responses[409] = {
			description: 'When start time is already present.',
			schema: {
				$status: 'fail',
				$error: 'Time is already present'
			}
		};
		#swagger.responses[500] = {
			description: 'When there is something with server.',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while saving time in db.'
			}
		};
		*/
	}
}

export async function getQuizStartTime(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const quizId = String(req.params.quizId ?? '');
	const user = req.user;
	try {
		if (!isValidMongoObjectId(quizId))
			throw createAnError(
				'Please send a valid quiz id',
				httpStatusCode.badRequest
			);

		const startTime = await QuizTimeTracker.find(
			{
				$and: [{ quizId: quizId, startedBy: user._id }]
			},
			{ _id: 0, startedAt: 1 }
		).lean();

		if (!startTime)
			throw createAnError(
				'Something went wrong while retrieving start time of the quiz from db'
			);
		if (startTime.length === 0)
			throw createAnError(
				'Start time is not present in db',
				httpStatusCode.notFound
			);
		if (startTime.length > 1)
			throw createAnError(
				'There is more than one time for this Quiz',
				httpStatusCode.conflict
			);

		return res.status(httpStatusCode.ok).json({
			status: 'success',
			startTime: startTime[0].startedAt
		});
	} catch (error) {
		next(error);
		//--------------Implementation part is done ---------------------

		//! Swagger docs
		/*
		#swagger.tags = ['Quiz'];
		#swagger.description = 'Endpoint to get start time of a quiz';
		#swagger.parameters['quizId'] = {
				in: 'query',
				description:
					'Quiz ID for which you want to retrieve its start time',
				required: true,
				type: 'string'
			};

		#swagger.responses[200] = {
			description: 'When start time is retrieved successfully',
			schema: {
				$status: 'success',
				startTime:'2022-06-05T12:45:38.998Z'
			}
		};
		#swagger.responses[400] = {
			description: 'When req body contains invalid quiz id.',
			schema: {
				$status: 'fail',
				$error: 'Please send a valid quiz id'
			}
		};
		#swagger.responses[404] = {
			description: 'When quiz is not found.',
			schema: {
				$status: 'fail',
				$error: 'Quiz is not present in DB'
			}
		};
		#swagger.responses[409] = {
			description: 'When more than one start time is present',
			schema: {
				$status: 'fail',
				$error: 'There is more than one time for this Quiz'
			}
		};
		#swagger.responses[500] = {
			description: 'When there is something with server',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while retrieving start time of the quiz from db'
			}
		};
		*/
	}
}

export async function getQuizzesHistory(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
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
		).lean();
		if (!rawQuizzesDetails)
			throw createAnError(
				'Something went wrong while retrieving quizzes'
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
		//--------------Implementation part is done ---------------------

		//! Swagger docs
		/*
		#swagger.tags = ['Quiz'];

		#swagger.description =
			'Endpoint to get quizzes history of current examinee.';

		#swagger.responses[200] = {
			description: 'When quizzes history of current examinee is retrieved.',
			schema: {
				$status: 'success',
				$quizzesDetails: [
					{
						quizId: '629ca58c0cf3c0efda1644b5',
						quizName: 'Quiz Name',
						quizDuration: 30,
						quizResult: {
							marks: 3,
							examineeId: '629ca42f8b22bd7a8ad4e496',
							numberOfRightAnswers: 3,
							numberOfWrongAnswers: 2,
							totalTimeTaken: 3,
							numberSkippedQuestions: 2
						}
					}
				]
			}
		};
		#swagger.responses[500] = {
			description: 'When there is something with server.',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while retrieving quizzes'
			}
		};
		*/
	}
}

export async function submitQuizHandler(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const quizId = String(req.body.quizId ?? '');
	const submittedQuestions = req.body.submittedQuestions;
	const user = req.user;
	try {
		if (!isValidMongoObjectId(quizId))
			throw createAnError(
				'Please give a valid quiz id',
				httpStatusCode.badRequest
			);
		if (!isValidSubmittedQuestions(submittedQuestions))
			throw createAnError(
				'Something wrong with submittedQuestions obj',
				httpStatusCode.badRequest
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
		//--------------Implementation part is done ---------------------

		//! Swagger docs
		/*
		#swagger.tags = ['Quiz'];

		#swagger.description = 'Endpoint to submit the quiz';

		#swagger.parameters['obj'] = {
			in: 'body',
			description: 'Quiz answers details',
			required: true,
			schema: {
				$quizId: '629ca58c0cf3c0efda1644b5',
				$submittedQuestions: [
					{
						_id: '629ca58c0cf3c0efda1644b5',
						answers: ['0']
					}
				]
			}
		};

		#swagger.responses[200] = {
			description: 'When quiz is submitted successfully',
			schema: {
				$status: 'success',
				$result: {
					marks: 2,
					numberOfRightAnswers: 2,
					numberOfWrongAnswers: 3,
					numberSkippedQuestions: 1,
					totalTimeTaken: 10
				}
			}
		};

		#swagger.responses[400] = {
			description: 'When there is something wrong with request body.',
			schema: {
				$status: 'fail',
				$error: 'Please give a valid quiz id  || Something wrong with submittedQuestions obj'
			}
		};
		#swagger.responses[500] = {
			description: 'When there is something with server',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while fetching questions from DB || Something went wrong while getting quiz start time || Something went wrong while saving the marks into db. Please try again'
			}
		};
		*/
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
