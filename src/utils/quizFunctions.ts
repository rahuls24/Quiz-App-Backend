import differenceInMinutes from 'date-fns/differenceInMinutes';
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
    questionsList.forEach((question) => {
        // if(question._id in )
    });
}

export function normalizeQuestionData(questionsList: Array<questionsListType>) {
    let normalizeQuestions: {
        [k: string]: Array<string>;
    } = {};
    questionsList.forEach((question) => {
        normalizeQuestions[question._id] = question.answers;
    });
    return normalizeQuestions;
}

export function calculateNumberOfRightWrongAnswersAndSkippedQuestion(
    questionsFromDB: normalizeQuestionType,
    questionFromReq: normalizeQuestionType
) {
    let correctAnswerCount = 0;
    let wrongAnswerCount = 0;
    let numberSkippedQuestions = 0;
    for (const questionId in questionsFromDB) {
        if (questionId in questionsFromDB && questionId in questionFromReq) {
            if (
                AreBothArraysEqual(
                    questionsFromDB[questionId],
                    questionFromReq[questionId]
                )
            )
                correctAnswerCount++;
            else if (questionFromReq[questionId].length > 0) wrongAnswerCount++;
            else numberSkippedQuestions++;
        } else throw new Error('Something went wrong');
    }
    return [correctAnswerCount, wrongAnswerCount, numberSkippedQuestions];
}

export function calculateMarks(
    correctAnswerCount: number,
    wrongAnswerCount: number,
    marksPerCorrectAnswer: number,
    marksPerWrongAnswer: number = 0.25,
    isNegativeMarkApplicable: boolean = false
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
export function differenceFromNowInMinutes(time = new Date()) {
    const now = new Date();
    return differenceInMinutes(now, time);
}
export function isUserAlreadyGivenQuiz(marksList: any, userId: any) {
    let flag = false;
    if (Array.isArray(marksList)) {
        marksList.forEach((marks) => {
            if (marks?.examineeId?.toString() === userId?.toString())
                return (flag = true);
        });
    }
    return flag;
}

export function getCurrentUserMarks(marksList: any[], userId: string) {
    return marksList.find((marks) => marks?.examineeId?.toString() === userId);
}
