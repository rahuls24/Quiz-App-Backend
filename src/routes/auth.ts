import { createUserWithEmailAndPassword, signinWithEmailAndPassword } from './../controllers/auth';
import {Router} from 'express';

export const router = Router();

router.post('/register-user-email', createUserWithEmailAndPassword);
router.post('/signin-user-email', signinWithEmailAndPassword);
