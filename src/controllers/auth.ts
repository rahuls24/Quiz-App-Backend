import { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { pick } from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import { RegisterUserPayload } from '../interfaces/authInterfaces';
import { User } from '../models/user';
import {
	generateBearerToken,
	isPasswordMatched,
	isUserPresentInDB, jwtTokenDecoder, saveUser
} from '../utils/authFunctions';
import { createAnError } from '../utils/errorHandler';
import { httpStatusCode, responseHandler } from '../utils/responseHandler';
import {
	isValidMongoObjectId, isValidReqBodyComingFromEmailLogin,
	isValidReqBodyComingFromEmailRegister,
	isValidReqBodyComingFromUpdateUser
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
		role: String(req.body.role ?? ''),
		isPasswordChangeRequired:false,
	};

	try {
		// Checking whether we are getting valid data from request body or not
		const [isReqBodyContainsValidData, errorMsg] =
			isValidReqBodyComingFromEmailRegister(newUser);

		if (!isReqBodyContainsValidData)
			throw createAnError(errorMsg, httpStatusCode.badRequest);

		const [isUserExists] = await isUserPresentInDB(newUser.email);

		if (isUserExists)
			throw createAnError(
				'User is already registered.',
				httpStatusCode.badRequest
			);
		const [isUserRegister, registerUser] = await saveUser(
			// We have already checking for validation of req object by calling isValidReqBodyComingFromEmailRegister function. So this explicit type casting will not cause any problem.
			newUser as RegisterUserPayload
		);

		if (!isUserRegister)
			throw createAnError(
				'Something went wrong while saving the user into db',
				httpStatusCode.internalServerError
			);

		const requiredPropertyForHashing = [
			'_id',
			'name',
			'email',
			'role',
			'isVerified',
			'isPasswordChangeRequired',
		];
		const bearerToken = generateBearerToken(
			pick(requiredPropertyForHashing, registerUser)
		);
		return res.status(httpStatusCode.created).json({
			status: 'success',
			token: `Bearer ${bearerToken}`,
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
	const currentUserFromReq = {
		email: String(req.body.email ?? ''),
		password: String(req.body.password ?? ''),
	};
	try {
		// Validation of body data start from here.
		const [isReqBodyContainsValidData, errorMsg] =
			isValidReqBodyComingFromEmailLogin(currentUserFromReq);

		if (!isReqBodyContainsValidData)
			throw createAnError(errorMsg, httpStatusCode.badRequest);

		const [isUserExists, currentUserFromDB] = await isUserPresentInDB(
			currentUserFromReq.email
		);

		if (!isUserExists)
			throw createAnError('User is not found', httpStatusCode.notFound);

		const isPasswordMatch = await isPasswordMatched(
			currentUserFromReq.password,
			currentUserFromDB.password
		);

		if (!isPasswordMatch)
			throw createAnError(
				'Password is not correct',
				httpStatusCode.unauthorized
			);
		const requiredPropertyForHashing = [
			'_id',
			'name',
			'email',
			'role',
			'isVerified',
			'isPasswordChangeRequired',
		];
		const bearerToken = generateBearerToken(
			pick(requiredPropertyForHashing, currentUserFromDB)
		);

		return res.status(httpStatusCode.ok).json({
			status: 'success',
			token: `Bearer ${bearerToken}`,
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
// Social Login
export async function signinWithGoogle(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const code = String(req.params.code ?? '');
	const userRole = 'examiner';
	try {

		// setup for token verification from google-auth-library.
		const client = new OAuth2Client(
			process.env.googleClintID,
			process.env.googleClientSecret,
			'postmessage'
		);
		const { tokens } = await client.getToken(code);
		if (!('id_token' in tokens))
			throw createAnError(
				'Something went wrong while validating code(token) from google for authentication',
				httpStatusCode.internalServerError
			);
		const [isDecoded, userDetailsOrErrorMsg] = jwtTokenDecoder(
			tokens.id_token
		);
		if (isDecoded === false)
			throw createAnError(
				userDetailsOrErrorMsg,
				httpStatusCode.internalServerError
			);
		const {
			email,
			name,
			picture = '',
			email_verified,
		} = userDetailsOrErrorMsg;

		let [isUserExists, currentUser] = await isUserPresentInDB(email);
		
		if (!isUserExists) {
			const registerUserPayload = {
				name,
				email,
				password: uuidv4(),
				role: userRole,
				isVerified: email_verified,
				profileImageUrl: picture,
				isPasswordChangeRequired:true,
			};
			const [isUserRegister, registerUser] = await saveUser(
				// We have already checking for validation of req object by calling isValidReqBodyComingFromEmailRegister function. So this explicit type casting will not cause any problem.
				registerUserPayload as RegisterUserPayload
			);

			if (!isUserRegister)
				throw createAnError(
					'Something went wrong while saving the user into db',
					httpStatusCode.internalServerError
				);

			// Assign the registerUser value to currentUser
			currentUser = registerUser;
		}

		const requiredPropertyForHashing = [
			'_id',
			'name',
			'email',
			'role',
			'isVerified',
			'isPasswordChangeRequired'
		];
		const bearerToken = generateBearerToken(
			pick(requiredPropertyForHashing, currentUser)
		);
		return res
			.status(isUserExists ? httpStatusCode.ok : httpStatusCode.created)
			.json({
				status: 'success',
				token: `Bearer ${bearerToken}`,
			});
	} catch (error) {
		next(error);
		//! Swagger docs

		/*
            #swagger.tags = ['Auth'];
            #swagger.description = 'Endpoint to sign in via google';
            #swagger.responses[200] = {
                description: 'User successfully obtained.',
                schema: {
                    $status: 'success',
                    $user: { $ref: '#/definitions/User' },
                },
            };
            #swagger.responses[400] = {
                description: 'when role is not valid',
                schema: {
                    $status: 'fail',
                    $error: 'Please provide a valid role. Role should be either examinee | examiner',
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
			__v: 0,
		}).lean();
		if (currentUser) {
			const resObj = {
				status: 'success',
				user: currentUser,
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
			#swagger.responses[500] = {
			description: 'When there is something wrong with server',
			schema: {
				$status: 'fail',
				$error: 'Something went wrong while saving the user into db',
			}
		};
      */
	}
}

export async function updateUserDetails(
	req: RequestForProtectedRoute,
	res: Response,
	next: NextFunction
){
	const {id,...updateOptions} = req.body;
	try {
		const [isReqBodyContainsValidPayload,errorMsg] = isValidReqBodyComingFromUpdateUser(updateOptions);
		if(!isReqBodyContainsValidPayload) throw createAnError(errorMsg,httpStatusCode.badRequest);
		if(!isValidMongoObjectId(id)) throw createAnError('Please give a valid id',httpStatusCode.badRequest);

		const filterOption= {_id:id};
		const updatedUserDetails = await User.findByIdAndUpdate(filterOption,updateOptions,{new:true,runValidators: true})
		return res.status(200).json({
			status: 'success',
			updatedUserDetails
		})
		
	} catch (error) {
		next(error)
	}
	
}
