import { Response } from 'express';

export function responseHandler(
	res: Response,
	status: number,
	payload: object
) {
	return res.status(status).json(payload);
}

export const httpStatusCode = {
	ok: 200,
	created: 201,
	accepted: 202,
	noContent: 204,
	movedPermanently: 301,
	badRequest: 400,
	unauthorized: 401,
	paymentRequired: 402,
	forbidden: 403,
	notFound: 404,
	notAllowed: 405,
	notAcceptable: 406,
	requestTimeout: 408,
	conflict: 409,
	internalServerError: 500,
	notImplemented: 501
};
