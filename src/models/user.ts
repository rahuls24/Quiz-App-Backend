import { model, Schema, Model, ValidatorProps } from 'mongoose';
import { isValidEmail } from '../utils/validators';
import { IUser } from '../interfaces/authInterfaces';

const userSchema = new Schema({
	name: {
		type: String,
		validate: {
			validator: (name: string) => name.length > 2,
			message: 'Name should be greater than 2 characters',
		},
		required: true,
	},
	email: {
		type: String,
		validate: {
			validator: (rawEmail: string) => isValidEmail(rawEmail),
			message: (props: any) => {
				return `${props.value}  is not a valid email address!`;
			},
		},
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
	},
	role: {
		type: String,
		required: true,
		enum: {
			values: ['examiner', 'examinee', 'admin'],
			message: '{VALUE} is not supported',
		},
	},
	quizzes: [
		{
			type: String,
		},
	],
	registerOn: {
		type: Date,
		default: Date.now,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
});
// Creating index base on email
userSchema.index({email:1},{unique:true})
export const User: Model<IUser> = model('User', userSchema);
