import { Request } from 'express';

export interface RequestForProtectedRoute extends Request {
	user: {
		_id: string;
		name: string;
		email: string;
		role: 'examiner' | 'examinee';
		isVerified: boolean;
	};
}

export interface ErrorWithStatus extends Error {
	status?: number;
}

export interface CommonObjectWithStringKey {
	[k: string]: any;
}
