import { Schema } from 'mongoose';

export interface IQuestion {
	questionText: string;
	questionType: 'singleAnswer' | 'multipleAnswer';
	quizzes: Array<Schema.Types.ObjectId>;
	options: Array<string>;
	answers: Array<string>;
	images?: string;
}
