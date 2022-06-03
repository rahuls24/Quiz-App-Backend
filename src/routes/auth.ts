import { createUserWithEmailAndPassword } from './../controllers/auth';
import {Router} from 'express';


export const router = Router();

router.post('/register-user-email', createUserWithEmailAndPassword);
