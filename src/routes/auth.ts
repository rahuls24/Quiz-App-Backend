import { Router } from 'express';
import passport from 'passport';
import {
	createUserWithEmailAndPassword,
	getUserDetails,
	signinWithEmailAndPassword,
	signinWithGoogle,
	isUserAlreadyRegistered,
} from './../controllers/auth';

export const router = Router();

router.get('/is-user-already-registered/:email', isUserAlreadyRegistered);
router.post('/register-user-with-email', createUserWithEmailAndPassword);

router.post('/signin-user-with-email', signinWithEmailAndPassword);

router.get(
	'/get-user-details',
	passport.authenticate('user', { session: false }),
	getUserDetails
);

router.post('/signin-user-with-google', signinWithGoogle);
