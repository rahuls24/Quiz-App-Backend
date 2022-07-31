import { Router } from 'express';
import passport from 'passport';
import {
	getAllQuestionsOfAQuiz,
	saveQuestionsForTheQuiz,
	submitQuizHandler,
} from '../controllers/question';
export const router = Router();

router.post(
	'/save-questions',
	passport.authenticate('examiner', { session: false }),
	saveQuestionsForTheQuiz,
);

router.get(
	'/get-all-questions/:quizId',
	passport.authenticate('user', { session: false }),
	getAllQuestionsOfAQuiz,
);
router.post(
	'/submit-quiz',
	passport.authenticate('examinee', { session: false }),
	submitQuizHandler,
);
