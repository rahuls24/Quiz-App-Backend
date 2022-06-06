import { model, Schema, Model, ValidatorProps } from 'mongoose';

const questionSchema = new Schema({
	questionText: {
		type: String,
		required: true,
	},
	questionType: {
		type: String,
		required: true,
		enum: {
			values: ['singleAnswer', 'MultipleAnswer'],
			message: '{VALUE} is not supported in questionType of question',
		},
	},
	quizzes: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Quiz',
			required: true,
		},
	],
	solvedBy: [
		{
			type: Object,
		},
	],
	options: [
		{
			type: String,
			required: true,
		},
	],
	answers: [
		{
			type: String,
			required: true,
		},
	],
});
questionSchema.index({ quizzes: 1, questionText: 'text' });
export const Quiz = model('Question', questionSchema);
