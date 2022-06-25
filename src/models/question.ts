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
			values: ['singleAnswer', 'multipleAnswer'],
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
	images: [
		{
			type: String,
			required: false,
		},
	],
});

questionSchema.index({ quizzes: 1 });
questionSchema.index({ questionText: 'text' });
export const Question = model('Question', questionSchema);
