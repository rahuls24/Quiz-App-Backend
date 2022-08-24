import { Schema } from 'mongoose';

export interface IMarks {
	marks: number;
	examineeId: Schema.Types.ObjectId;
	numberOfRightAnswers: number;
	numberOfWrongAnswers: number;
	numberSkippedQuestions: number;
	totalTimeTaken: number;
}
export interface IQuiz {
	name: string;
	topics: Array<string>;
	createdBy: Schema.Types.ObjectId;
	enrolledBy: Array<Schema.Types.ObjectId>;
	marks: Array<IMarks>;
	isFree: boolean;
	price: number;
	imageUrl: string;
	createOn: Date;
	quizDuration: number;
}

export interface IQuizTimeTracker {
	quizId: Schema.Types.ObjectId;
	startedAt: Date;
	startedBy: Schema.Types.ObjectId;
}
