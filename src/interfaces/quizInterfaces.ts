import { Types } from 'mongoose';

export interface IMarks {
	marks: number;
	examineeId: Types.ObjectId;
	numberOfRightAnswers: number;
	numberOfWrongAnswers: number;
	numberSkippedQuestions: number;
	totalTimeTaken: number;
}
export interface IQuiz {
	name: string;
	topics: Array<string>;
	createdBy: Types.ObjectId;
	enrolledBy: Array<Types.ObjectId>;
	marks: Array<IMarks>;
	isFree: boolean;
	price: number;
	imageUrl: string;
	createOn: Date;
	quizDuration: number;
}

export interface IQuizTimeTracker {
	quizId: Types.ObjectId;
	startedAt: Date;
	startedBy: Types.ObjectId;
}
