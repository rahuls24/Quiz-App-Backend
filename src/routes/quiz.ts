import { Router } from 'express';
import passport from 'passport';
import {
	saveQuiz,
	getAllQuizzesForCurrentExaminer,
	getAllQuizzesForExaminers,
	enrollAExaminee,
	getAllQuizForCurrentExaminee,
} from '../controllers/quiz';
export const router = Router();

router.post(
	'/save-quiz',
	passport.authenticate('examiner', { session: false }),
	saveQuiz,
);
router.get(
	'/get-all-quizzes-for-examiner',
	passport.authenticate('examiner', { session: false }),
	getAllQuizzesForCurrentExaminer,
);
router.post(
	'/get-quizzes-of-examiners',
	passport.authenticate('user', { session: false }),
	getAllQuizzesForExaminers,
);
router.get(
	'/get-all-quizzes-for-examinee',
	passport.authenticate('examinee',{session:false}),
	getAllQuizForCurrentExaminee,
);
router.post(
	'/enroll-in-a-quiz',
	passport.authenticate('examinee', { session: false }),
	enrollAExaminee,
);
