import isEmail from 'validator/lib/isEmail';

export function isValidEmail(email: string): Boolean {
	return isEmail(email);
}

export function AreEveryThingsComingInReqBodyForUser(reqUser: any): boolean {
	if (!reqUser.name) return false;
	if (!reqUser.email) return false;
	if (!reqUser.role) return false;
	if (!reqUser.email) return false;
	return true;
}
