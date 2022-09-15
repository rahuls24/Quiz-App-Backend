import { compare, genSaltSync, hashSync } from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { sign } from 'jsonwebtoken';
import { User } from '../models/user';
import { createAnError } from '../utils/errorHandler';
import { httpStatusCode, responseHandler } from '../utils/responseHandler';
import {
	isValidReqBodyComingFromEmailLogin,
	isValidReqBodyComingFromEmailRegister
} from '../utils/validators';
import { RequestForProtectedRoute } from './../interfaces/common';
export async function createUserWithEmailAndPassword(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const newUser = {
		name: String(req.body.name ?? ''),
		email: String(req.body.email ?? ''),
		password: String(req.body.password ?? ''),
		role: String(req.body.role ?? '')
	};

	try {
		// Checking whether we are getting valid data from request body or not
		const [isReqBodyContainsValidData, errorMsg] =
			isValidReqBodyComingFromEmailRegister(newUser);
		if (!isReqBodyContainsValidData)
			throw createAnError(errorMsg, httpStatusCode.badRequest);

		const isUserExists = await User.findOne({ email: newUser.email });
		if (isUserExists)
			throw createAnError(
				'User is already registered.',
				httpStatusCode.badRequest
			);
		// Generating the hash of password
		newUser.password = hashSync(
			newUser.password,
			genSaltSync(Number(process.env.bcryptSaltRounds))
		);
		const registerUser = await new User(newUser).save();
		if (!registerUser)
			throw createAnError(
				'Something went wrong while saving the user into db',
				httpStatusCode.internalServerError
			);
		return res.status(httpStatusCode.created).json({
			status: 'success'
		});
	} catch (error) {
		next(error);
		//! Swagger docs

		/* #swagger.tags = ['Auth'];

		#swagger.description =
			'Endpoint to register user with email and password';

		#swagger.parameters['obj'] = {
			in: 'body',
			description: 'User information.',
			required: true,
			schema: {
				$name: 'Rahul Kumar',
				$email: 'examinee@quiz.com',
				$password: 'qwerty',
				$user: { $ref: '#/definitions/Role' }
			}
		};

		#swagger.responses[201] = {
			description: 'User is created successfully.',
			schema: {
				$status: 'success',
			}
		};

		#swagger.responses[400] = {
			description: 'When there is something wrong with request body.',
			schema: {
				$status: 'fail',
				$error: { $ref: '#/definitions/BadRequestForCreateUserWithEmailAndPassword' }
			}
		}; 
		#swagger.responses[500] = {
			description: 'When there is something wrong with server',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while saving the user into db',
			}
		}; */
	}
}
export async function signinWithEmailAndPassword(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const currentUser = {
		email: String(req.body.email ?? ''),
		password: String(req.body.password ?? '')
	};
	try {
		// Validation of body data start from here.
		const [isReqBodyContainsValidData, errorMsg] =
			isValidReqBodyComingFromEmailLogin(currentUser);
		if (!isReqBodyContainsValidData)
			throw createAnError(errorMsg, httpStatusCode.badRequest);
		const user = await User.findOne(
			{ email: currentUser.email },
			{ __v: 0 }
		).lean();
		if (!user)
			throw createAnError('User is not found', httpStatusCode.notFound);

		const isPasswordMatch = await compare(
			currentUser.password,
			user.password
		);

		if (!isPasswordMatch)
			throw createAnError(
				'Password is not correct',
				httpStatusCode.unauthorized
			);

		const userDataForHash = {
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			isVerified: user.isVerified
		};

		const bearerToken = sign(
			{
				exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
				data: userDataForHash
			},
			process.env.JWTSecretKey ?? 'defaultJwtKey'
		);

		return res.status(httpStatusCode.ok).json({
			status: 'success',
			token: 'Bearer ' + bearerToken
		});
	} catch (error) {
		next(error);

		//! Swagger docs

		/*
            #swagger.tags = ['Auth'];

            #swagger.description = 'Endpoint to get login (JWT Based login) token(Bearer Token). ';

            #swagger.parameters['obj'] = {
                in: 'body',
                description: 'User information.',
                required: true,
                schema: {
                    $email: 'examinee@quiz.com',
                    $password: 'qwerty',
                },
            };
            
            #swagger.responses[200] = {
                description: 'Bearer Token is successfully generated.',
                schema: {
                    $status: 'success',
                    $token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                },
            };

            #swagger.responses[400] = {
                description: 'When there is something wrong with request body.',
                schema: {
                    $status: 'fail',
                    $error: { $ref: '#/definitions/BadRequestForSigninWithEmailAndPassword' },
                },
            };
            #swagger.responses[401] = {
                description: 'When password is incorrect',
                schema: {
                    $status: 'fail',
                    $error: 'Password is not correct',
                },
            };
        */
	}
}

export async function getUserDetails(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
) {
	const user = req.user;
	try {
		const currentUser = await User.findById(user._id, {
			password: 0,
			__v: 0
		});
		if (currentUser) {
			let resObj = {
				status: 'success',
				user: currentUser
			};
			return responseHandler(res, httpStatusCode.ok, resObj);
		}
		throw createAnError('No user found in DB.', 404);
	} catch (error) {
		next(error);

		//! Swagger docs

		/*
            #swagger.tags = ['Auth'];
            #swagger.description = 'Endpoint to get current login user details';
            #swagger.security = [
                {
                    apiKeyAuth: [],
                },
            ];
            #swagger.responses[200] = {
                description: 'User successfully obtained.',
                schema: {
                    $status: 'success',
                    $user: { $ref: '#/definitions/User' },
                },
            };
            #swagger.responses[404] = {
                description: 'When user is not present in db.',
                schema: {
                    $status: 'fail',
                    $error: 'No user found in DB.',
                },
            };
      */
	}
}

// Social Login
export async function signinWithGoogle(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const token = String(req.params.token ?? '');
	console.log(req.params.role);
	try {
		const client = new OAuth2Client(process.env.googleClintID);
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.googleClintID
		});
		// payload: {
		// 	iss: 'https://accounts.google.com',
		// 	nbf: 1663228319,
		// 	aud: '861995391720-na3k1i4mligk0t3jdu95ag2o4abbppk6.apps.googleusercontent.com',
		// 	sub: '103978681801242188832',
		// 	email: 'itsrahuls24@gmail.com',
		// 	email_verified: true,
		// 	azp: '861995391720-na3k1i4mligk0t3jdu95ag2o4abbppk6.apps.googleusercontent.com',
		// 	name: 'Rahul Kumar',
		// 	picture: 'https://lh3.googleusercontent.com/a-/AFdZucpQlyl48xU-YQBMmD6xk02O8Jzmp90Uq4Lpxxzt=s96-c',
		// 	given_name: 'Rahul',
		// 	family_name: 'Kumar',
		// 	iat: 1663228619,
		// 	exp: 1663232219,
		// 	jti: '602ab77194a826193e5e060d960fa7cfe1ece08e'
		//   }
		if (!('payload' in ticket))
			throw createAnError(
				'Something went wrong while validating token from google. Please try again.'
			);
		const { email, name, picture, email_verified } = ticket.getPayload();

		return res.send('ok');
	} catch (error) {
		next(error);
	}
}
