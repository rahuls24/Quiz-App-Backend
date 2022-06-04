import isEmail from 'validator/lib/isEmail';

export function isValidEmail(email: string): Boolean {
	return isEmail(email);
}

export function AreEveryThingsComingInEmailRegisterReqBody(reqUser: any): boolean {
	if (!reqUser.name) return false;
	if (!reqUser.email) return false;
	if (!reqUser.role) return false;
	if (!reqUser.password) return false;
	return true;
}
export function AreEveryThingsComingInEmailSigninReqBody(reqUser:any):boolean{
	if (!reqUser.email) return false;
	if (!reqUser.password) return false;
	return true
}
