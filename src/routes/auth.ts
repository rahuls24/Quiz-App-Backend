import { Router } from 'express';
import passport from 'passport';
import {
	createUserWithEmailAndPassword,
	getUserDetails,
	signinWithEmailAndPassword,
	signinWithGoogle,
} from './../controllers/auth';

export const router = Router();

router.post('/register-user-with-email', createUserWithEmailAndPassword);

router.post('/signin-user-with-email', signinWithEmailAndPassword);

router.get(
	'/get-user-details',
	passport.authenticate('user', { session: false }),
	getUserDetails
);

router.post('/signin-with-google/', signinWithGoogle);
