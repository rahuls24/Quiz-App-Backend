import { AreBothArraysEqual } from './validators';

type questionsListType = {
	_id: string;
	answers: Array<string>;
};
type normalizeQuestionType = {
	[k: string]: Array<string>;
};
export function groupQuestionsById(questionsList: Array<questionsListType>) {
	let groupedQuestions: {
		[k: string]: [];
	} = {};
	questionsList.forEach(question => {
		// if(question._id in )
	});
}

export function normalizeQuestionData(questionsList: Array<questionsListType>) {
	let normalizeQuestions: {
		[k: string]: Array<string>;
	} = {};
	questionsList.forEach(question => {
		normalizeQuestions[question._id] = question.answers;
	});
	return normalizeQuestions;
}

export function calculateNumberOfRightWrongAnswersAndSkippedQuestion(
	questionsFromDB: normalizeQuestionType,
	questionFromReq: normalizeQuestionType,
) {
	let correctAnswerCount = 0;
	let wrongAnswerCount = 0;
	let skippedQuestions = 0;
	for (const questionId in questionsFromDB) {
		if (
			AreBothArraysEqual(
				questionsFromDB[questionId],
				questionFromReq[questionId],
			)
		)
			correctAnswerCount++;
		else if (questionFromReq[questionId].length > 0) wrongAnswerCount++;
		else skippedQuestions++;
	}
	return [correctAnswerCount, wrongAnswerCount, skippedQuestions];
}

export function calculateMarks(
	correctAnswerCount: number,
	wrongAnswerCount: number,
	marksPerCorrectAnswer: number,
	marksPerWrongAnswer: number = 0.25,
	isNegativeMarkApplicable: boolean = false,
) {
	const totalMarksForCorrectAnswer =
		correctAnswerCount * marksPerCorrectAnswer;
	if (!isNegativeMarkApplicable) {
		return totalMarksForCorrectAnswer;
	} else {
		const totalMarksForWrongAnswer =
			correctAnswerCount * marksPerWrongAnswer;
		return totalMarksForCorrectAnswer - totalMarksForWrongAnswer;
	}
}
