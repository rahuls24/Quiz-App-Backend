//Util Functions
import { genSaltSync, hashSync } from 'bcryptjs';
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
	const registerUser = await new User(newUser).save();

	if (registerUser) return [true, registerUser];
	return [false, null];
}

export async function isUserPresentInDB(
	email: string
): Promise<[boolean, IUser | null]> {
	const isUserExists = await User.findOne({ email }).lean();

	if (isUserExists) return [true, isUserExists];
	return [false, null];
}

export async function getBererToken() {}
