import { model, Schema } from 'mongoose';
import { IQuiz } from '../interfaces/quizInterfaces';
const quizSchema = new Schema<IQuiz>({
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
    isFree: {
        type: Boolean,
        default: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    imageUrl: {
        type: String,
        default:
            'https://media-fastly.hackerearth.com/media/hackathon/breaking-the-bottleneck-shortened-supply-chains-3/images/8e89265cdc-cb1-hackathon-2022-listing-pg-image-300dpi_1.jpg',
    },
    createOn: {
        type: Date,
        default: Date.now,
    },
    quizDuration: {
        type: Number,
        required: true,
    },
});
quizSchema.index({ createdBy: 1 });
quizSchema.index({ enrolledBy: 1 });
quizSchema.index({ isFree: 1 });
quizSchema.index({ name: 'text' });

export const Quiz = model('Quiz', quizSchema);
