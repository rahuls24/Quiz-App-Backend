export interface RegisterUserPayload {
	name: string;
	email: string;
	password: string;
	phone?: string;
	role: 'examiner' | 'examinee' | 'admin';
}
export interface IUser extends RegisterUserPayload {
	quizzes: string[];
	registerOn?: Date;
	isVerified: boolean;
}
