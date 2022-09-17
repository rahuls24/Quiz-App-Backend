//Util Functions
import { compare, genSaltSync, hashSync } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { IUser, RegisterUserPayload } from '../interfaces/authInterfaces';
import { User } from '../models/user';
export async function saveUser(
	newUser: RegisterUserPayload
): Promise<[boolean, IUser | null]> {
	// Hashing the password
	newUser.password = hashSync(
		newUser.password,
		genSaltSync(Number(process.env.bcryptSaltRounds))
	);
	const registerUser =  (await new User(newUser).save()).toObject();
	if (registerUser) return [true, registerUser];
	return [false, null];
}

export async function isUserPresentInDB(
	email: string
): Promise<[true, IUser] | [false,null]> {
	const isUserExists = await User.findOne({ email }).lean();

	if (isUserExists) return [true, isUserExists];
	return [false, null];
}

export function generateBearerToken(data: any, exp?: number) {
	const bearerToken = sign(
		{
			exp: exp ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
			data
		},
		process.env.JWTSecretKey ?? 'defaultJwtKey'
	);
	return bearerToken;
}

export async function isPasswordMatched(
	rawPassword: string,
	hashedPassword: string
) {
	return await compare(rawPassword, hashedPassword);
}
