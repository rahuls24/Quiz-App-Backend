export interface RegisterUserPayload {
	name: string;
	email: string;
	password: string;
	role: 'examiner' | 'examinee' | 'admin';
	phone?: string;
}
export interface IUser extends RegisterUserPayload {
	_id:string;
	registerOn: Date;
	isVerified: boolean;
	isPasswordChangeRequired:boolean;
	profileImageUrl?:string,

	
}
