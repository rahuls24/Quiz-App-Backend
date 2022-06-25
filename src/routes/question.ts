import { Router } from 'express';
import passport from 'passport';
import { getAllQuestionsOfAQuiz, saveQuestionsForTheQuiz } from '../controllers/question';
export const router = Router();

router.post(
	'/save-questions',
	passport.authenticate('examiner', { session: false }),
	saveQuestionsForTheQuiz,
);

router.get(
	'/get-all-questions/:quizId',
	passport.authenticate('user', { session: false }),
	getAllQuestionsOfAQuiz
);
