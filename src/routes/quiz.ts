import { Router } from 'express';
import passport from 'passport';
import {
	saveQuiz,
	getAllQuizzesForExaminers,
	enrollAExamineeInAQuiz,
	getAllQuizzesForCurrentUser,
	getAllUnEnrolledQuizForCurrentUser,
} from '../controllers/quiz';
export const router = Router();

router.post(
	'/save-a-quiz',
	passport.authenticate('examiner', { session: false }),
	saveQuiz,
);
router.post(
	'/get-quizzes-of-examiners',
	passport.authenticate('user', { session: false }),
	getAllQuizzesForExaminers,
);
router.get(
	'/get-all-enrolled-quizzes',
	passport.authenticate('user', { session: false }),
	getAllQuizzesForCurrentUser,
);
router.get(
	'/get-all-unenrolled-quizzes',
	passport.authenticate('user', { session: false }),
	getAllUnEnrolledQuizForCurrentUser,
);
router.post(
	'/enroll-for-a-quiz',
	passport.authenticate('examinee', { session: false }),
	enrollAExamineeInAQuiz,
);
