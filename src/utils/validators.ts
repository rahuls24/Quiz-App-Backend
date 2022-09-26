import { Types } from 'mongoose';
import { equals, intersection } from 'ramda';
import isEmail from 'validator/lib/isEmail';
import isEmpty from 'validator/lib/isEmpty';
import { CommonObjectWithStringKey } from '../interfaces/common';
import { createLookupArrayForElementAbsence } from '../utils/commonFunctions';
export function isValidEmail(email: string): boolean {
	return isEmail(email);
}
export function isEmptyString(str: string) {
	return isEmpty(str, { ignore_whitespace: true });
}
export function isValidMongoObjectId(objectId: any): boolean {
	try {
		return Types.ObjectId.isValid(objectId);
	} catch (error) {
		return false;
	}
}

type ReqUserFormEmailRegister = {
	name: string;
	email: string;
	password: string;
	role: string;
};
export function isValidReqBodyComingFromEmailRegister(
	reqUser: ReqUserFormEmailRegister
): [false, string] | [true, null] {
	if (Object.keys(reqUser).some(isEmptyString))
		return [false, 'Please provide value for all the parameter'];
	// Individual validation
	if (!isValidEmail(reqUser.email))
		return [false, 'Please provide a valid email'];
	if (reqUser.password.length < 6)
		return [false, 'Password should be of minimum 6 characters'];
	if (reqUser.name.length < 3)
		return [false, 'Name should be of minimum 6 characters'];
	if (!isValidRole(reqUser.role))
		return [false, 'Role will be either examinee or examiner'];
	return [true, null];
}

export function isValidReqBodyComingFromUpdateUser(
	reqObj: CommonObjectWithStringKey
): [true, null] | [false, string] {
	const VALID_FIELD = {
		name: '',
		email: '',
		password: '',
		registerOn: new Date(),
		isVerified: false,
		role: 'examinee',
		isPasswordChangeRequired: false
	};
	const validFieldKeys = Object.keys(VALID_FIELD);
	const reqObjKeys = Object.keys(reqObj);
	// If reqObjKeys of length 0 it means req body does not contains any attribute.
	if (reqObjKeys.length === 0) return [false, 'Request body is empty'];
	const validFieldKeysComingFromReqObj = intersection(
		validFieldKeys,
		reqObjKeys
	);

	//  If the length is equal it means that all attributes are valid in reqObj.
	if (
		validFieldKeysComingFromReqObj.length === reqObjKeys.length &&
		reqObjKeys.length !== 0
	)
		return [true, null];

	//  If function executing this part means there are some invalid attributes present in reqObj.
	const isElementAbsenceInValidFieldKeys =
		createLookupArrayForElementAbsence(validFieldKeys);
	const invalidFieldKeysComingFromReqObj = reqObjKeys.filter(
		isElementAbsenceInValidFieldKeys
	);

	const errorMsg = `These attributes  ( ${invalidFieldKeysComingFromReqObj.join(
		' | '
	)} ) are invalid. The valid attributes are ( ${validFieldKeys.join(
		' | '
	)} )`;
	return [false, errorMsg];
}
export function isValidRole(role: string): boolean {
	const VALID_USER_ROLE = ['examinee', 'examiner'];
	return VALID_USER_ROLE.includes(role.toLowerCase());
}

type ReqUserFromEmailLogin = {
	email: string;
	password: string;
};
export function isValidReqBodyComingFromEmailLogin(
	reqUser: ReqUserFromEmailLogin
): [true, null] | [false, string] {
	if (Object.values(reqUser).some(isEmptyString))
		return [false, 'Please provide value for all the parameter'];
	if (!isValidEmail(reqUser.email))
		return [false, 'Please provide a valid email'];
	if (reqUser.password.length < 6)
		return [false, 'Password should be of minimum 6 characters'];
	return [true, null];
}
type ReqQuizFromSaveQuiz = {
	name: string;
	topics: Array<string>;
	createdBy: string;
	enrolledBy: Array<string>;
	quizDuration: string;
};

export function isValidReqBodyComingFromSaveQuiz(
	reqQuiz: ReqQuizFromSaveQuiz
): [true, null] | [false, string] {
	if (reqQuiz.name.length === 0) return [false, 'Please provide quiz name'];
	if (isNaN(Number(reqQuiz.quizDuration)))
		return [false, 'Please provide a valid number for quiz duration'];
	return [true, null];
}
export function isValidReqBodyComingFromGetAllQuizzesForExaminers(
	reqExaminers: any
): [true, null] | [false, string] {
	if (!reqExaminers) return [false, 'Please send examiner data'];
	if (!Array.isArray(reqExaminers))
		return [false, 'Please send examiner data in array format'];
	if (
		Array.isArray(reqExaminers) &&
		!reqExaminers.every(isValidMongoObjectId)
	)
		return [false, 'Please send valid examiner id.'];
	return [true, null];
}
export function isValidQuestionData(question: any = {}): boolean {
	if (
		!(
			typeof question.questionText === 'string' &&
			question.questionText.length > 0
		)
	)
		return false;

	if (
		!(
			typeof question.questionType === 'string' &&
			/* cspell: disable-next-line */
			(question.questionType.toLowerCase() === 'singleanswer' ||
				/* cspell: disable-next-line */
				question.questionType.toLowerCase() === 'multipleanswer')
		)
	)
		return false;
	if (
		!(
			Array.isArray(question.quizzes) &&
			question.quizzes.every(isValidMongoObjectId)
		)
	)
		return false;

	if (
		!(
			Array.isArray(question.options) &&
			question.options.every(isValidOption)
		)
	)
		return false;
	const isValidAnswer = isValidAnswerHelper(question.options.length);
	if (
		!(
			Array.isArray(question.answers) &&
			question.answers.every(isValidAnswer)
		)
	)
		return false;

	return true;

	// Helper function
	function isValidOption(option: any) {
		return typeof option === 'string' && option.trim().length > 0;
	}
	function isValidAnswerHelper(optionLength: number) {
		return (answer: any) => {
			return (
				Number.isFinite(parseInt(answer)) &&
				parseInt(answer) < optionLength
			);
		};
	}
}
export function isValidSubmittedQuestions(questionsList: any): boolean {
	if (!Array.isArray(questionsList)) return false;
	if (
		!questionsList.every((question: any) =>
			Array.isArray(question?.answers)
		)
	)
		return false;
	if (
		!questionsList.every((question: any) =>
			isValidMongoObjectId(question?._id)
		)
	)
		return false;
	return true;
}
export function AreBothArraysEqual(arr1: any[], arr2: any[]): boolean {
	return equals(arr1.sort(), arr2.sort());
}
