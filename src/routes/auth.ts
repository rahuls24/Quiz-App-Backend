import { Router } from 'express';
import passport from 'passport';
import {
	createUserWithEmailAndPassword,
	getUserDetails,
	signinWithEmailAndPassword,
	signinWithGoogle,
	updateUserDetails
} from './../controllers/auth';

export const router = Router();

router.post('/register-user-with-email', createUserWithEmailAndPassword);

router.post('/signin-user-with-email', signinWithEmailAndPassword);

router.get('/signin-with-google/:token/:role', signinWithGoogle);

router.patch(
	'/update-user-details',
	passport.authenticate('user', { session: false }),
	updateUserDetails
);

router.get(
	'/get-user-details',
	passport.authenticate('user', { session: false }),
	getUserDetails
);
