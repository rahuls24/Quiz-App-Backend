import {Types} from 'mongoose';
import isEmail from 'validator/lib/isEmail';
export function isValidEmail(email: string): Boolean {
	return isEmail(email);
}
export function isValidMongoObjectId(objectId:any):Boolean{
	try {
		return Types.ObjectId.isValid(objectId);
	} catch (error) {
		return false
	}
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
export function AreEveryThingsComingInSaveQuizReqBody(reqQuiz: any): boolean {
	if(!reqQuiz.name) return false
	return true;
}
