import { Types } from 'mongoose';
import isEmail from 'validator/lib/isEmail';
export function isValidEmail(email: string): Boolean {
	return isEmail(email);
}
export function isValidMongoObjectId(objectId: any): Boolean {
	try {
		return Types.ObjectId.isValid(objectId);
	} catch (error) {
		return false;
	}
}

export function AreEveryThingsComingInEmailRegisterReqBody(
	reqUser: any,
): boolean {
	if (!reqUser.name) return false;
	if (!reqUser.email) return false;
	if (!reqUser.role) return false;
	if (!reqUser.password) return false;
	return true;
}
export function AreEveryThingsComingInEmailSigninReqBody(
	reqUser: any,
): boolean {
	if (!reqUser.email) return false;
	if (!reqUser.password) return false;
	return true;
}
export function AreEveryThingsComingInSaveQuizReqBody(reqQuiz: any): boolean {
	if (!reqQuiz.name) return false;
	return true;
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
			(question.questionType.toLowerCase() === 'singleanswer' ||
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
