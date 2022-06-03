import {  Response } from 'express';
export function errorHandlerOfRequestCatchBlock(
	res: Response,
	err: Error,
) {
    return res.status(500).json({
        status:'fail',
        errorMsg: err.message
    })
}
