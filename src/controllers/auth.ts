import { RequestForProtectedRoute } from './../interfaces/common';
import { Request, Response, NextFunction } from 'express';
import { responseHandler, httpStatusCode } from '../utils/responseHandler';
import {
	AreEveryThingsComingInEmailRegisterReqBody,
	AreEveryThingsComingInEmailSigninReqBody,
	isValidEmail,
} from '../utils/validators';
import { User } from '../models/user';
import { genSaltSync, hashSync, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import {
	createFailureResponseObj,
	errorHandlerOfRequestCatchBlock,
} from '../utils/errorHandler';

export async function createUserWithEmailAndPassword(
	req: Request,
	res: Response,
) {
	const newUser = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		phone: req.body.phone,
		role: req.body.role,
	};
	if (!AreEveryThingsComingInEmailRegisterReqBody(newUser)) {
		let resObj = createFailureResponseObj('Please send all required data');
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	if (!isValidEmail(newUser.email)) {
		let resObj = createFailureResponseObj(
			'Password should be of minimum 6 character',
		);
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	if (newUser.password instanceof String && newUser.password.length < 6) {
		let resObj = createFailureResponseObj(
			'Password should be of minimum 6 character',
		);
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	if (newUser.name instanceof String && newUser.name.length < 3) {
		let resObj = createFailureResponseObj(
			'Password should be of minimum 6 character',
		);
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	try {
		const isUserExists = await User.findOne({ email: newUser.email });
		if (isUserExists) {
			let resObj = createFailureResponseObj('User Already register');
			return responseHandler(res, httpStatusCode.badRequest, resObj);
		}
		// Generating the hash of password
		newUser.password = hashSync(
			newUser.password,
			genSaltSync(Number(process.env.bcryptSaltRounds)),
		);
		const registerUser = await new User(newUser).save();
		if (registerUser) {
			let resObj = {
				status: 'success',
				user: registerUser,
			};
			return responseHandler(res, httpStatusCode.created, resObj);
		}
		throw new Error('Something went wrong while registering the user');
	} catch (error) {
		return errorHandlerOfRequestCatchBlock(res, error);
	}
}
export async function signinWithEmailAndPassword(req: Request, res: Response) {
	const currentUser = {
		email: req.body.email,
		password: req.body.password,
	};

	if (!AreEveryThingsComingInEmailSigninReqBody(currentUser)) {
		let resObj = createFailureResponseObj('Please send all required data');
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	if (!isValidEmail(currentUser.email)) {
		let resObj = createFailureResponseObj('Please give a valid email');
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	if (
		currentUser.password instanceof String &&
		currentUser.password.length < 6
	) {
		let resObj = createFailureResponseObj(
			'Password should be of minimum 6 character',
		);
		return responseHandler(res, httpStatusCode.badRequest, resObj);
	}
	try {
		const user = await User.findOne(
			{ email: currentUser.email },
			{ __v: 0 },
		);
		if (!user) {
			let resObj = createFailureResponseObj('User is not found');
			return responseHandler(res, httpStatusCode.notFound, resObj);
		}
		const isPasswordMatch = await compare(
			currentUser.password,
			user.password,
		);
		if (!isPasswordMatch) {
			let resObj = createFailureResponseObj('Password is not correct');
			return responseHandler(res, httpStatusCode.badRequest, resObj);
		}
		const userDataForHash = {
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			isVerified: user.isVerified,
		};
		const bearerToken = sign(
			{
				// exp: Math.floor(Date.now() / 1000) + 120,
				exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
				data: userDataForHash,
			},
			process.env.JWTSecretKey ?? 'defaultJwtKey',
		);

		return res.status(httpStatusCode.ok).json({
			status: 'success',
			token: 'Bearer ' + bearerToken,
		});
	} catch (error) {
		return errorHandlerOfRequestCatchBlock(res, error);
	}
}

export async function getUserDetails(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction,
) {
	const user = req.user;
	try {
		const currentUser = await User.findById(user._id, {
			password: 0,
			__v: 0,
		});
		if (currentUser) {
			let resObj = {
				status: 'success',
				user: currentUser,
			};
			return responseHandler(res, httpStatusCode.ok, resObj);
		}
		throw new Error('Something went wrong while registering the user');
	} catch (error) {
		next(error);
	}
}
