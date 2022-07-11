import { model, Schema } from 'mongoose';

const quizTimeTrackerSchema = new Schema({
	quizId: {
		type: Schema.Types.ObjectId,
		ref: 'Quiz',
		required: true,
	},
	startedAt: {
		type: Date,
		default:Date.now
	},
	startedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});
quizTimeTrackerSchema.index({ startedAt: 1 }, { expireAfterSeconds: 120*60 });

export const QuizTimeTracker = model('QuizTimeTracker', quizTimeTrackerSchema);
