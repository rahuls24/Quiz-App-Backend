import { Response } from 'express';

export function responseHandler(
	res: Response,
	status: number,
	payload: object,
) {
	return res.status(status).json(payload);
}
