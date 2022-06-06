import { Quiz } from './../models/quiz';
import { httpStatusCode } from './../utils/responseHandler';
import { Request, Response } from 'express';
import { responseHandler } from '../utils/responseHandler';
import {
	createFailureResponseObj,
	errorHandlerOfRequestCatchBlock,
} from '../utils/errorHandler';
import {
	AreEveryThingsComingInSaveQuizReqBody,
	isValidMongoObjectId,
} from '../utils/validators';
export async function saveQuiz(req: Request, res: Response) {
	const user: any = req.user;
	const newQuiz = {
		name: req.body.name,
		topics: req.body.topics ?? ([] as string[]),
		marks: [] as object[],
		createdBy: user._id,
		enrolledBy: [user._id],
	};
	if (!AreEveryThingsComingInSaveQuizReqBody(newQuiz)) {
		let resObj = createFailureResponseObj('Please send all required data');
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	try {
		const quiz = await new Quiz(newQuiz).save();
		if (!quiz) {
			let resObj = createFailureResponseObj('Something went wrong');
			return responseHandler(
				res,
				httpStatusCode.internalServerError,
				resObj,
			);
		}
		let resObj = {
			status: 'success',
			quiz: quiz,
		};
		return responseHandler(res, httpStatusCode.created, resObj);
	} catch (error) {
		return errorHandlerOfRequestCatchBlock(res, error);
	}
}

export async function getAllQuizzesForCurrentExaminer(
	req: Request,
	res: Response,
) {
	const user: any = req.user;
	const currentExaminerId = user?._id;
	try {
		const quizzes = await Quiz.find({ createdBy: currentExaminerId });
		if (!quizzes) {
			let resObj = createFailureResponseObj('Something went wrong');
			return responseHandler(
				res,
				httpStatusCode.internalServerError,
				resObj,
			);
		}
		let resObj = {
			status: 'success',
			quizzes: quizzes,
		};
		return responseHandler(res, httpStatusCode.ok, resObj);
	} catch (error) {
		return errorHandlerOfRequestCatchBlock(res, error);
	}
}

export async function getAllQuizzesForExaminers(req: Request, res: Response) {
	const examiners = req.body.examiners;
	if (!examiners) {
		let resObj = createFailureResponseObj('Please send examiner data');
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	if (!(examiners instanceof Array)) {
		let resObj = createFailureResponseObj(
			'Please send examiner data in array format',
		);
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	if (!examiners.every(isValidMongoObjectId)) {
		let resObj = createFailureResponseObj(
			'Please send a valid examiner id',
		);
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	try {
		const quizzes = await Quiz.find({ createdBy: { $in: examiners } });
		if (!quizzes) {
			let resObj = createFailureResponseObj('Something went wrong');
			return responseHandler(
				res,
				httpStatusCode.internalServerError,
				resObj,
			);
		}
		let resObj = {
			status: 'success',
			quizzes: quizzes,
		};
		return responseHandler(res, httpStatusCode.ok, resObj);
	} catch (error) {
		return errorHandlerOfRequestCatchBlock(res, error);
	}
}

export async function getAllQuizForCurrentExaminee(
	req: Request,
	res: Response,
) {
	console.log(req)
	const user: any = req.user;
	const currentExamineeId = user._id;
	try {
		const quizzes = await Quiz.find({
			enrolledBy: { $in: [currentExamineeId] },
		});
		if (!quizzes) {
			let resObj = createFailureResponseObj('Something went wrong');
			return responseHandler(
				res,
				httpStatusCode.internalServerError,
				resObj,
			);
		}
		let resObj = {
			status: 'success',
			quizzes: quizzes,
		};
		return responseHandler(res, httpStatusCode.ok, resObj);
	} catch (error) {
		return errorHandlerOfRequestCatchBlock(res, error);
	}
}

export async function enrollAExaminee(req: Request, res: Response) {
	const user: any = req.user;
	let quizId = req.body.quizId;
	if (!isValidMongoObjectId(quizId)) {
		let resObj = createFailureResponseObj('Please send a valid quiz id');
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	try {
		// TODO: Add logic to handle paid quizzes.
		const updatedQuiz = await Quiz.updateOne(
			{ _id: quizId },
			{ $addToSet: { enrolledBy: user._id } },
		);
		if (updatedQuiz.modifiedCount === 0) {
			let resObj = createFailureResponseObj(
				'User is already enrolled in this quiz or quiz may not found',
			);
			return responseHandler(res, httpStatusCode.notAllowed, resObj);
		}
		const resObj = {
			status: 'success',
		};
		return responseHandler(res, httpStatusCode.noContent, resObj);
	} catch (error) {
		return errorHandlerOfRequestCatchBlock(res, error);
	}
}
