import { Types } from 'mongoose';
import { equals } from 'ramda';
import isEmail from 'validator/lib/isEmail';
import isEmpty from 'validator/lib/isEmpty';
import { CommonObjectWithStringKey } from './../interfaces/common';

export function isValidEmail(email: string): Boolean {
	return isEmail(email);
}
export function isEmptyString(str: string) {
	return isEmpty(str, { ignore_whitespace: true });
}
export function isValidMongoObjectId(objectId: any): Boolean {
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
): [boolean, string] {
	const VALID_USER_ROLE = ['examinee', 'examiner'];
	if (Object.keys(reqUser).some(isEmptyString))
		return [false, 'Please provide value for all the parameter'];
	// Individual validation
	if (!isValidEmail(reqUser.email))
		return [false, 'Please provide a valid email'];
	if (reqUser.password.length < 6)
		return [false, 'Password should be of minimum 6 characters'];
	if (reqUser.name.length < 3)
		return [false, 'Name should be of minimum 6 characters'];
	if (!VALID_USER_ROLE.includes(reqUser.role.toLowerCase()))
		return [false, 'Role will be either examinee or examiner'];
	return [true, ''];
}

type ReqUserFromEmailLogin = {
	email: string;
	password: string;
};
export function isValidReqBodyComingFromEmailLogin(
	reqUser: ReqUserFromEmailLogin
): [boolean, string] {
	if (Object.keys(reqUser).some(isEmptyString))
		return [false, 'Please provide value for all the parameter'];
	if (!isValidEmail(reqUser.email))
		return [false, 'Please provide a valid email'];
	if (reqUser.password.length < 6)
		return [false, 'Password should be of minimum 6 characters'];
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
): [boolean, string] {
	if (reqQuiz.name.length < 0) return [false, 'Please provide quiz name'];
	if (isNaN(Number(reqQuiz.quizDuration)))
		return [false, 'Please provide a valid number for quiz duration'];
}
export function isValidReqBodyComingFromGetAllQuizzesForExaminers(
	reqExaminers: any
): [boolean, string] {
	if (!reqExaminers) return [false, 'Please send examiner data'];
	if (!Array.isArray(reqExaminers))
		return [false, 'Please send examiner data in array format'];
	if (
		Array.isArray(reqExaminers) &&
		!reqExaminers.every(isValidMongoObjectId)
	)
		return [false, 'Please send valid examiner id.'];
	return [true, ''];
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
export function isValidSubmittedQuestions(questionsList: any) {
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
export function AreBothArraysEqual(arr1: any[], arr2: any[]) {
	return equals(arr1.sort(), arr2.sort());
}
export function AreBothObjectsEqual(
	obj1: CommonObjectWithStringKey,
	obj2: CommonObjectWithStringKey
) {
	console.log(obj1, obj2);
	for (const key in obj1) {
		if (!(key in obj2)) return false;
		if (!AreBothArraysEqual(obj1[key], obj2[key])) return false;
	}
	return true;
}
