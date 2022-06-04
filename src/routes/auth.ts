import { createUserWithEmailAndPassword, signinWithEmailAndPassword } from './../controllers/auth';
import {Router} from 'express';
import passport from 'passport'

export const router = Router();

router.post('/register-user-email', createUserWithEmailAndPassword);
router.post('/signin-user-email', signinWithEmailAndPassword);
