import { model, Schema, Model, ValidatorProps } from 'mongoose';

const quizSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	topics: [
		{
			type: String,
		},
	],
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	enrolledBy: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	marks: [
		{
			type: Object,
		},
	],
	isFree:{
		type:Boolean,
		default:true
	},
	price:{
		type:Number,
		default:0
	},
	createOn: {
		type: Date,
		default: Date.now,
	},
});
quizSchema.index({ createdBy: 1});
quizSchema.index({ enrolledBy:1});
quizSchema.index({ isFree:1});
quizSchema.index({  name: 'text'});

export const Quiz = model('Quiz', quizSchema);
