export interface RegisterUserPayload {
	name: string;
	email: string;
	password: string;
	role: 'examiner' | 'examinee' | 'admin';
	phone?: string;
}
export interface IUser extends RegisterUserPayload {
	_id:string;
	quizzes: string[];
	registerOn: Date;
	isVerified: boolean;
	profileImageUrl?:string,
	
}
