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
	AreEveryThingsComingInSaveQuizReqBody,
	isValidMongoObjectId,
	isValidSubmittedQuestions
} from '../utils/validators';
import { Quiz } from './../models/quiz';
import { QuizTimeTracker } from './../models/quizTimeTracker';
import { httpStatusCode } from './../utils/responseHandler';

export async function saveQuiz(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	const newQuiz = {
		name: req.body.name,
		topics: req.body.topics ?? ['misc'],
		marks: [] as object[],
		createdBy: user._id,
		enrolledBy: [user._id],
		quizDuration: req.body.totalTime
	};
	if (!AreEveryThingsComingInSaveQuizReqBody(newQuiz)) {
		let resObj = createFailureResponseObj('Please send all required data');
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	if (typeof newQuiz.topics === 'string') {
		newQuiz.topics = newQuiz.topics.split(',');
	}
	try {
		const quiz = await new Quiz(newQuiz).save();
		if (!quiz)
			throw createAnError('Something went wrong while saving the quiz');
		let resObj = {
			status: 'success',
			quiz: quiz
		};
		return responseHandler(res, httpStatusCode.created, resObj);
	} catch (error) {
		next(error);
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
		const quizzes = await Quiz.find({ createdBy: currentExaminerId });
		if (!quizzes)
			throw createAnError(
				'Something went wrong while getting quiz for the examiner'
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

export async function getAllQuizzesForExaminers(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const examiners = req.body.examiners;
	if (!examiners) {
		let resObj = createFailureResponseObj('Please send examiner data');
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	if (!(examiners instanceof Array)) {
		let resObj = createFailureResponseObj(
			'Please send examiner data in array format'
		);
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	if (!examiners.every(isValidMongoObjectId)) {
		let resObj = createFailureResponseObj(
			'Please send a valid examiner id'
		);
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	try {
		const quizzes = await Quiz.find({ createdBy: { $in: examiners } });
		if (!quizzes)
			throw createAnError(
				'Something went wrong while getting quiz for examiners'
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
}

export async function enrollAExamineeInAQuiz(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	const userId = user._id;
	let quizId = req.body.quizId;
	if (!isValidMongoObjectId(quizId)) {
		let resObj = createFailureResponseObj('Please send a valid quiz id');
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	try {
		// TODO: Add logic to handle paid quizzes.
		const updatedQuiz = await Quiz.updateOne(
			{ _id: quizId },
			{ $addToSet: { enrolledBy: new Schema.Types.ObjectId(userId) } }
		);

		if (updatedQuiz.modifiedCount === 0) {
			let resObj = createFailureResponseObj(
				'User is already enrolled in this quiz or quiz may not found'
			);
			return responseHandler(res, httpStatusCode.notAllowed, resObj);
		}
		const resObj = {
			status: 'success'
		};
		return responseHandler(res, httpStatusCode.noContent, resObj);
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
		const normalizeQuestionsDataFromReqObj = normalizeQuestionData(
			submittedQuestions
		);
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
function delayForGivenTime(time: number) {
	return new Promise((res, rej) => {
		setTimeout(() => {
			res(24);
		}, time);
	});
}
