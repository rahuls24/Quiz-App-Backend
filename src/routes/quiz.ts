import { Router } from 'express';
import passport from 'passport';
import {
    enrollAExamineeInAQuiz,
    getAllQuizzesForCurrentUser,
    getAllQuizzesForExaminers,
    getAllUnEnrolledQuizForCurrentUser,
    getQuizStartTime,
    getQuizzesHistory,
    saveQuiz,
    saveQuizStartTime,
    submitQuizHandler,
} from '../controllers/quiz';
export const router = Router();

router.post(
    '/save-a-quiz',
    passport.authenticate('examiner', { session: false }),
    saveQuiz
);
router.post(
    '/get-quizzes-of-examiners',
    passport.authenticate('user', { session: false }),
    getAllQuizzesForExaminers
);
router.get(
    '/get-all-enrolled-quizzes',
    passport.authenticate('user', { session: false }),
    getAllQuizzesForCurrentUser
);
router.get(
    '/get-all-unenrolled-quizzes',
    passport.authenticate('user', { session: false }),
    getAllUnEnrolledQuizForCurrentUser
);
router.post(
    '/enroll-for-a-quiz',
    passport.authenticate('examinee', { session: false }),
    enrollAExamineeInAQuiz
);

router.post(
    '/save-start-time',
    passport.authenticate('examinee', { session: false }),
    saveQuizStartTime
);

router.get(
    '/get-quiz-start-time/:quizId',
    passport.authenticate('examinee', { session: false }),
    getQuizStartTime
);
router.post(
    '/submit-quiz',
    passport.authenticate('examinee', { session: false }),
    submitQuizHandler
);
router.get(
    '/get-quizzes-history',
    passport.authenticate('examinee', { session: false }),
    getQuizzesHistory
);
