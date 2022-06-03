import { IUser } from '../interfaces/authInterfaces';
import { Request, Response } from 'express';
import { responseHandler } from '../utils/responseHandler';
import {
	AreEveryThingsComingInReqBodyForUser,
	isValidEmail,
} from '../utils/validators';
import { User } from '../models/user';
import { genSaltSync, hashSync } from 'bcryptjs';
import { errorHandlerOfRequestCatchBlock } from '../utils/errorHandler';

export const createUserWithEmailAndPassword = async (
	req: Request,
	res: Response,
) => {
	const newUser = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		phone: req.body.phone,
		role: req.body.role,
		quizzes: [] as string[],
	};
	if (!AreEveryThingsComingInReqBodyForUser(newUser)) {
		let resObj = {
			status: 'fail',
			error: 'Please send all required data',
		};
		return responseHandler(res, 400, resObj);
	}
	if (!isValidEmail(newUser.email)) {
		let resObj = {
			status: 'fail',
			error: 'Please give a valid email',
		};
		return responseHandler(res, 400, resObj);
	}
	if (newUser.password instanceof String && newUser.password.length < 6) {
		let resObj = {
			status: 'fail',
			error: 'Password should be of minimum 6 character',
		};
		return responseHandler(res, 400, resObj);
	}
	if (newUser.name instanceof String && newUser.password.length < 3) {
		let resObj = {
			status: 'fail',
			error: 'Name should be of minimum 3 character',
		};
		return responseHandler(res, 400, resObj);
	}
	try {
		const isUserExists = await User.findOne({ email: newUser.email });
		if (isUserExists) {
			let resObj = {
				status: 'fail',
				error: 'User Already register',
			};
			return responseHandler(res, 400, resObj);
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
			return responseHandler(res, 201, resObj);
		}
		throw new Error('Something went wrong while registering the user')
	} catch (error) {
	   return	errorHandlerOfRequestCatchBlock(res,error)
	}
};
