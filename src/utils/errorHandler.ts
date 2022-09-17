import { Response } from 'express';
import { ErrorWithStatus } from './../interfaces/common';
export function errorHandlerOfRequestCatchBlock(res: Response, err: Error) {
	return res.status(500).json({
		status: 'fail',
		errorMsg: err.message
	});
}
export function createFailureResponseObj(errorMsg: string) {
	return {
		status: 'fail',
		error: errorMsg
	};
}

export function createAnError(errorMsg: string, statusCode = 500) {
	const error: ErrorWithStatus = new Error(errorMsg);
	error.status = statusCode;
	return error;
}
